import ServerDataModel from "../../models/server-data";
import { executeCommandOnSSH, parseSizeToGB } from '../../util';


type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    usernameSSH: string,
    passwordSSH: string,
}

export default async function updateDiskUsageDataTask(serverMeta: ICreateServerMetaBody) {
    if (serverMeta.isCluster) {
        for (const nodeHostname of serverMeta.nodesHostnames) {
            // Assuming all nodes in cluster have the same username and password
            const diskUsageData = await getDiskUsage(nodeHostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
            await updateOrCreateDiskUsageData(serverMeta.hostname, nodeHostname, diskUsageData)
        }
    } else {
        const diskUsageData = await getDiskUsage(serverMeta.hostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
        await updateOrCreateDiskUsageData(serverMeta.hostname, serverMeta.hostname, diskUsageData)
    }
}

interface CurrentDiskUsage {
    used: number,
    capacity: number,
    timestamp: number
}

async function updateOrCreateDiskUsageData(serverHostname: string, nodeHostname: string, diskUsageData: CurrentDiskUsage) {
    try {
        console.log(`Disk usage data for server ${nodeHostname}:`, JSON.stringify(diskUsageData));
        // Check if the document and array element exist
        let server = await ServerDataModel.findOne({ hostname: serverHostname });
        if (!server) {
            // If server does not exist, create it with the initial data
            server = new ServerDataModel({
                hostname: serverHostname,
                diskUsages: [{
                    nodeName: nodeHostname, 
                    past20MinUsage: [diskUsageData.used], 
                    capacity: diskUsageData.capacity,
                    timestamps: [diskUsageData.timestamp], 
                }],
            });
            await server.save();
        } else {
            // If server exists, check if the specific diskUsage element exists
            const diskUsage = server.diskUsages.find(du => du.nodeName === nodeHostname);

            if (!diskUsage) {
                // If diskUsage element does not exist, add it
                server.diskUsages.push({ 
                    nodeName: nodeHostname, 
                    past20MinUsage: [diskUsageData.used], 
                    capacity: diskUsageData.capacity,
                    timestamps: [diskUsageData.timestamp], 
                });
            } else {
                // If diskUsage element exists, update it
                diskUsage.past20MinUsage.push(diskUsageData.used);
                diskUsage.timestamps.push(diskUsageData.timestamp);

                if (diskUsage.past20MinUsage.length > 10) {
                    diskUsage.past20MinUsage.shift(); // Keep only the last 10 elements
                }
                if (diskUsage.timestamps.length > 10) {
                    diskUsage.timestamps.shift();
                }

                if (diskUsageData.used !== -1 && diskUsage.capacity !== diskUsageData.capacity) {
                    diskUsage.capacity = diskUsageData.capacity;
                }
            }
            await server.save();
        }
    } catch (error) {
        console.error(`Failed to update disk data for server ${nodeHostname}:`, error);
    }
}



async function getDiskUsage(
    hostname: string,
    serverSSHUsername: string,
    serverSSHPassword: string
): Promise<CurrentDiskUsage> {
    const command = `df -h`;
    try {
        const output = await executeCommandOnSSH(command, hostname, serverSSHUsername, serverSSHPassword);
        console.log(`Command output: ${output}`);
        return parseDiskUsageData(output);
    } catch (e) {
        console.error(`GetDiskUsage failed for ${hostname}---Error: `, e)
    }
    return { used: -1, capacity: 0, timestamp: Date.now() };
}

function parseDiskUsageData(data: string): CurrentDiskUsage {
    const volumeData = extractVolumeData(data, '/dev/mapper/vg02-pssvol');
    return volumeData;
}

/**
 * Data format example:
 *  Filesystem                 Size  Used Avail Use% Mounted on
    devtmpfs                   5.8G     0  5.8G   0% /dev
    tmpfs                      5.8G     0  5.8G   0% /dev/shm
    tmpfs                      5.8G   57M  5.7G   1% /run
    tmpfs                      5.8G     0  5.8G   0% /sys/fs/cgroup
    /dev/mapper/vg00-slashvol   16G  6.3G  8.4G  43% /
    /dev/sda1                  463M  286M  149M  66% /boot
    /dev/mapper/vg01-logvol     20G   24K   19G   1% /log
    /dev/mapper/vg02-pssvol     98G   18G   76G  19% /pss
 */
function extractVolumeData(output: string, volume: string): CurrentDiskUsage {
    const lines = output.split('\n');
    for (const line of lines) {
        if (line.includes(volume)) {
            const parts = line.split(/\s+/);
            // Expecting Size to be in first column and Used in second column
            return {
                capacity: parseSizeToGB(parts[1]), // Input format example: 98G
                used: parseSizeToGB(parts[2]),
                timestamp: Date.now()
            };
        }
    }
    return { used: -1, capacity: 0, timestamp: Date.now() };
}