import ServerDataModel from "../../models/server-data";
import executeSQL from "../../services/databaseService";
import { config } from 'mssql';

export type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    showDatabaseInfo: boolean,
    databaseServerHost: string,
    databaseUsername: string,
    databasePassword: string,
    selectedDatabases: string[],
}

export default async function updateDatabaseDataTask(serverMeta: ICreateServerMetaBody) {
    try {
        const databaseData = await getDatabaseData(serverMeta);

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            {
                databaseStatus: databaseData
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update data for server ${serverMeta.hostname}:`, error);
    }
}

async function getDatabaseData(serverMeta: ICreateServerMetaBody) {
    const config: config = {
        user: serverMeta.databaseUsername,
        password: serverMeta.databasePassword,
        server: serverMeta.databaseServerHost,
        database: 'master',
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    };
    console.log("Config: ", config);
    const selectedDatabases = serverMeta.selectedDatabases;
    const query =
        `SELECT 
            name AS databaseName, 
            state_desc AS status
        FROM 
            sys.databases
        WHERE 
            name IN (${selectedDatabases.map(db => `'${db}'`).join(', ')});
        `;
    console.log("Query: ", query);
    const recordset = await executeSQL(
        serverMeta.databaseServerHost,
        config,
        query
    );
    console.log("Recordset: ",recordset)
    return recordset;
}
