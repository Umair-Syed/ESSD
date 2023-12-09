import ServerDataModel  from "../../models/server-data";
  
  
type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
}

export default async function updateDatabaseDataTask(serverMeta: ICreateServerMetaBody) {
    try {
        const databaseData = await getDatabaseData();

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                databaseConnection: databaseData
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update data for server ${serverMeta.hostname}:`, error);
    }
}

async function getDatabaseData() {
    // TODO: get from SQL database after confirmation
    return { activeConnections: 100 };
}
