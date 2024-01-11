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
    if (!serverMeta.showDatabaseInfo) {
        console.log(`Skipping database task for server ${serverMeta.hostname} as showDatabaseInfo is false`);
        return;
    }
    try {
        const databaseData = await getDatabaseData(serverMeta);

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            {
                $set: { databaseStatus: databaseData }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update database data for server ${serverMeta.hostname}:`, error);
    }
}

async function getDatabaseData(serverMeta: ICreateServerMetaBody) {
    try {
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
    } catch (error) {
        console.error(`Failed to get database data for ${serverMeta.hostname}`, error);
        return [];
    }
}
