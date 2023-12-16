import { RequestHandler } from "express";
import executeSQL from "../services/databaseService";
import { config } from 'mssql';

type databaseCredentials = {
    databaseServer: string,
    username: string,
    password: string,
}


export const getDatabases: RequestHandler<unknown, unknown, databaseCredentials, unknown> = async (req, res) => {
    const {databaseServer, username, password } = req.body;
    console.log(req.body)
    try {
        console.log(`getDatabases: server: ${databaseServer}..username: ${username}...password: ${password} `);
        const config: config = {
            user: username,
            password: password,
            server: databaseServer,
            database: 'master',
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        };
        
        const recordset = await executeSQL(databaseServer, config, 'SELECT name FROM sys.databases;')
        
        res.status(200).json({ databases: recordset });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error, message: 'Failed to get databases' });
    }
}