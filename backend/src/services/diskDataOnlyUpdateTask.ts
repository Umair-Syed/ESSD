import ServersMetaModel from '../models/server-meta';
import ServerDataModel  from "../models/server-data";

export default async function diskDataOnlyUpdateTask() {
    try {
      const servers = await ServersMetaModel.find();
      for (const server of servers) {
        await updateServerDiskData(server);
      }
    } catch (error) {
      console.error('Failed to execute main update task:', error);
    }
  }
  
  
type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
}

async function updateServerDiskData(serverMeta: ICreateServerMetaBody) {
    try {
        const diskUsageData = await getDiskUsage();

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                diskUsages: diskUsageData
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update disk data for server ${serverMeta.hostname}:`, error);
    }
}
async function getDiskUsage() {
    // TODO: get disk data from server using sshpass
}
