import ServerDataModel  from "../../models/server-data";
import executeCommandOnSSH from '../../util';
  
  
type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
}

export default async function updateDiskUsageDataTask(serverMeta: ICreateServerMetaBody) {
    try {
        const diskUsageData = await getDiskUsage(serverMeta.hostname);

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                diskUsages: diskUsageData,
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update disk data for server ${serverMeta.hostname}:`, error);
    }
}

async function getDiskUsage(hostname: string) {
    const command = `df -h`;
    try {
      const output = await executeCommandOnSSH(command, hostname, 'root', '1ntell1dot');
      console.log(`Command output: ${output}`);
      // TODO: Parse and get window ?
    } catch (e) {
      console.error('Error:', e)
    }  
}