import ServerDataModel  from "../../models/server-data";
import { executeCommandOnSSH } from '../../util';

interface ICreateServerMetaBody {
    hostname: string,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    usernameSSH: string,
    passwordSSH: string,
}


export default async function updateServerInfoDataTask(serverMeta: ICreateServerMetaBody) {
    try {
        const serverVersion = await getServerVersion(serverMeta.hostname, serverMeta.usernameSSH, serverMeta.passwordSSH);
        if (serverVersion === "") {
            console.error(`Failed to get server version for ${serverMeta.hostname}`);
            return;
        }
        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                serverVersion: serverVersion,
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update server info data for server ${serverMeta.hostname}:`, error);
    }
}


async function getServerVersion(
    hostname: string,
    serverSSHUsername: string,
    serverSSHPassword: string
): Promise<string> {
    const command = `rpm -q pss-org-services`;
    try {
        const output = await executeCommandOnSSH(command, hostname, serverSSHUsername, serverSSHPassword);
        console.log(`rpm -q pss-org-services OUTPUT: ${output}`);
        return extractVersion(output);
    } catch (e) {
        console.error(`Get pss-org-services version failed for ${hostname}---Error: `, e)
    }
    return "";
}

function extractVersion(input: string): string {
    const pattern = /pss-org-services-([^-\s]+)/;
    const match = input.match(pattern);
    return match ? match[1] : "";
}