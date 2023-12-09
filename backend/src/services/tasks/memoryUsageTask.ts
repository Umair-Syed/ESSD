import ServerDataModel  from "../../models/server-data";
import executeCommandOnSSH from '../../util';

  
type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
}

export default async function updateMemoryUsageDataTask(serverMeta: ICreateServerMetaBody) {
    try {
        const memoryUsageData = await getMemoryUsage(serverMeta.hostname);

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                memoryUsages: memoryUsageData
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update disk data for server ${serverMeta.hostname}:`, error);
    }
}

async function getMemoryUsage(hostname: string) {
  const command = `free -m`;
  try {
    const output = await executeCommandOnSSH(command, hostname, 'root', '1ntell1dot');
    console.log(`Command output: ${output}`);
  } catch (e) {
    console.error('Error:', e)
  }  
}