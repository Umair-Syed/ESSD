import ServerDataModel  from "../../models/server-data";
import { executeCommandOnSSH } from '../../util';

interface ICreateServerMetaBody {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    usernameSSH: string,
    passwordSSH: string,
}


export default async function updateSupervisorctlStatusTask(serverMeta: ICreateServerMetaBody) {
    try {
        
        if (serverMeta.isCluster) {
            for (const nodeHostname of serverMeta.nodesHostnames) {
                const supervisorData = await getSupervisorData(nodeHostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
                await updateSupervisorData(serverMeta.hostname, nodeHostname, supervisorData);
            }
        } else {
            const supervisorData = await getSupervisorData(serverMeta.hostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
            await updateSupervisorData(serverMeta.hostname, serverMeta.hostname, supervisorData);
        }

    } catch (error) {
        console.error(`Failed to update services data for server ${serverMeta.hostname}:`, error);
    }
}

interface ProcessesStatus {
    name: string;
    status: string;
}

async function updateSupervisorData(serverHostname: string, nodeHostname: string, processesStatus: ProcessesStatus[]) {
    try {
        // First, try to update an existing node's status
        const updated = await ServerDataModel.findOneAndUpdate(
            { hostname: serverHostname, 'supervisorctlStatus.nodeName': nodeHostname },
            { 
                $set: { 'supervisorctlStatus.$.processesStatus': processesStatus }
            },
            { new: true }
        );

        // If the node was not found and updated, add a new node status
        if (!updated) {
            await ServerDataModel.findOneAndUpdate(
                { hostname: serverHostname },
                { 
                    $push: { supervisorctlStatus: { nodeName: nodeHostname, processesStatus: processesStatus } }
                },
                { upsert: true, new: true }
            );
        }
    } catch (error) {
        console.error(`Failed to update supervisor data for server ${serverHostname}:`, error);
    }
}


async function getSupervisorData(
    hostname: string,
    serverSSHUsername: string,
    serverSSHPassword: string
): Promise<ProcessesStatus[]> {
    const command = `supervisorctl status`;
    try {
        const output = await executeCommandOnSSH(command, hostname, serverSSHUsername, serverSSHPassword);
        console.log(`Command output of supervisorctl status: ${output}`);
        return parseSupervisorStatsData(output);
    } catch (e) {
        console.error(`getSupervisorData failed for ${hostname}---Error: `, e);
        return [];
    }
}


function parseSupervisorStatsData(data: string): ProcessesStatus[] {
    const lines = data.split('\n');
    const statuses: ProcessesStatus[] = [];

    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
            const name = parts[0];
            const status = parts[1];
            statuses.push({ name, status });
        }
    }

    return statuses;
}