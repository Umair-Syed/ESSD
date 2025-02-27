import ServerDataModel from "../../models/server-data";
import { executeCommandOnSSH } from '../../util';


type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    usernameSSH: string,
    passwordSSH: string,
}

export default async function updateMemoryUsageDataTask(serverMeta: ICreateServerMetaBody) {
    if (serverMeta.isCluster) {
        for (const nodeHostname of serverMeta.nodesHostnames) {
            // Assuming all nodes in cluster have the same username and password
            const memoryPressureData = await getMemoryPressure(nodeHostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
            await updateOrCreateMemoryPressureData(serverMeta.hostname, nodeHostname, memoryPressureData)
        }
    } else {
        const memoryPressureData = await getMemoryPressure(serverMeta.hostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
        await updateOrCreateMemoryPressureData(serverMeta.hostname, serverMeta.hostname, memoryPressureData)
    }
}

interface CurrentMemoryPressureData {
    memory: {
        total: number,
        used: number,
    },
    swap: {
        total: number,
        used: number,
    }
    timestamp: number
}

async function updateOrCreateMemoryPressureData(serverHostname: string, nodeHostname: string, memoryPressureData: CurrentMemoryPressureData) {
    try {
        console.log(`Memory pressure data for server ${nodeHostname}:`, JSON.stringify(memoryPressureData));

        let server = await ServerDataModel.findOne({ hostname: serverHostname });
        if (!server) {
            server = new ServerDataModel({
                hostname: serverHostname,
                memoryPressure: [{
                    nodeName: nodeHostname,
                    memory: {
                        total: memoryPressureData.memory.total,
                        used: [memoryPressureData.memory.used]
                    },
                    swap: {
                        total: memoryPressureData.swap.total,
                        used: [memoryPressureData.swap.used]
                    },
                    timestamps: [memoryPressureData.timestamp],
                }],
            });
            await server.save();
        } else {
            const memoryPressure = server.memoryPressure.find(mp => mp.nodeName === nodeHostname);

            if (!memoryPressure) {
                server.memoryPressure.push({
                    nodeName: nodeHostname,
                    memory: {
                        total: memoryPressureData.memory.total,
                        used: [memoryPressureData.memory.used]
                    },
                    swap: {
                        total: memoryPressureData.swap.total,
                        used: [memoryPressureData.swap.used]
                    },
                    timestamps: [memoryPressureData.timestamp],
                });
            } else if (memoryPressure.memory && memoryPressure.swap) { // if memoryPressure exists, then memory and swap will also exist, so this check is only for Lint error
                memoryPressure.memory.used.push(memoryPressureData.memory.used);
                memoryPressure.swap.used.push(memoryPressureData.swap.used);
                memoryPressure.timestamps.push(memoryPressureData.timestamp);

                // Keep only the last 10 elements for used memory and used swap
                if (memoryPressure.memory.used.length > 10) {
                    memoryPressure.memory.used.shift();
                }
                if (memoryPressure.swap.used.length > 10) {
                    memoryPressure.swap.used.shift();
                }
                if (memoryPressure.timestamps.length > 10) {
                    memoryPressure.timestamps.shift();
                }
                if ((memoryPressureData.memory.used !== -1 && memoryPressureData.swap.used !== -1)
                    && (memoryPressure.memory.total !== memoryPressureData.memory.total || memoryPressure.swap.total !== memoryPressureData.swap.total)) {
                    memoryPressure.memory.total = memoryPressureData.memory.total;
                    memoryPressure.swap.total = memoryPressureData.swap.total;
                }

            }
            await server.save();
        }
    } catch (error) {
        console.error(`Failed to update memory data for server ${nodeHostname}:`, error);
    }
}



async function getMemoryPressure(
    hostname: string,
    serverSSHUsername: string,
    serverSSHPassword: string
): Promise<CurrentMemoryPressureData> {
    const command = `free -m`;
    try {
        const output = await executeCommandOnSSH(command, hostname, serverSSHUsername, serverSSHPassword);
        console.log(`Command output: ${output}`);
        return parseMemoryPressureData(output);
    } catch (e) {
        console.error(`GetMemoryPressure failed for ${hostname}---Error: `, e)
    }
    return {
        memory: { total: 0, used: -1 },
        swap: { total: 0, used: -1 },
        timestamp: Date.now(),
    };
}


/**
 * Data example format:
              total        used        free      shared  buff/cache   available
Mem:          11728       10187         322           7        1217        1177
Swap:          3815        2392        1423
*/
function parseMemoryPressureData(data: string): CurrentMemoryPressureData {

    const lines = data.split('\n');
    const memoryData = lines.find(line => line.startsWith('Mem:'));
    const swapData = lines.find(line => line.startsWith('Swap:'));

    // Expecting total to be in first column, used in second column
    const parseLine = (line: string) => {
        const parts = line.split(/\s+/).map(part => parseInt(part, 10));
        // parts[1] is total, parts[2] is used
        return { total: parts[1], used: parts[2] };
    };

    return {
        memory: memoryData ? parseLine(memoryData) : { total: 0, used: -1 },
        swap: swapData ? parseLine(swapData) : { total: 0, used: -1 },
        timestamp: Date.now(),
    };
}
