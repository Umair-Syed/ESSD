import ServersMetaModel from '../models/server-meta';
import ServerDataModel  from "../models/server-data";
import axios from 'axios';

export default async function serverDataUpdateTask() {
    try {
      const servers = await ServersMetaModel.find();
      for (const server of servers) {
        await updateServerData(server);
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

async function updateServerData(serverMeta: ICreateServerMetaBody) {
    try {
        const servicesData = await getServicesData(serverMeta.hostname);
        const databaseData = await getDatabaseData();

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                services: servicesData,
                databaseConnection: databaseData
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update data for server ${serverMeta.hostname}:`, error);
    }
}

async function getServicesData(hostname: string) {
    // TODO: auth first
    const apiUrl = `https://${hostname}:2443/configuration-service-admin/cluster/nodes?namespace=/serviceRegistry&_=1700746112434`;
    const response = await axios.get(apiUrl);
    return response.data;
}

async function getDatabaseData() {
    // TODO: get from SQL database after confirmation
    return { activeConnections: 100 };
}
