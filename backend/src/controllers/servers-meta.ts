import { RequestHandler } from "express";
import ServerMetaModel  from "../models/server-meta";
import ServerDataModel  from "../models/server-data";


export const getServersMeta: RequestHandler = async (req, res) => {
    try {
        const serversMeta = await ServerMetaModel.find().exec();
        console.log(serversMeta);   
        res.status(200).json(serversMeta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

type ICreateServerMetaBody = {
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
    selectedFilters: string[],
}

export const createServerMeta: RequestHandler<unknown, unknown, ICreateServerMetaBody, unknown> = async (req, res) => {
    const {
        hostname, 
        isCluster, 
        nodesHostnames, 
        userName2443, 
        password2443,
        showDatabaseInfo,
        databaseServerHost,
        databaseUsername,
        databasePassword,
        selectedDatabases,
        selectedFilters,
    } = req.body;

    try {
        const newServerMeta = await ServerMetaModel.create({
            hostname,
            isCluster,
            nodesHostnames, // will be empty if isCluster is false
            userName2443,
            password2443,
            showDatabaseInfo,
            databaseServerHost, // will be empty if showDatabaseInfo is false
            databaseUsername, // will be empty if showDatabaseInfo is false
            databasePassword, // will be empty if showDatabaseInfo is false
            selectedDatabases, // will be empty if showDatabaseInfo is false
            selectedFilters,
        });

        createServerDataWithHostnameAndFilters(hostname, selectedFilters);

        res.status(201).json(newServerMeta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

async function createServerDataWithHostnameAndFilters(hostname: string, selectedFilters: string[]) {
    /*
        Will create a new server data document in serversdatas collection, with the hostname and filters.
        Rest of the fields will be created later when CRON task will run.
    */
    await ServerDataModel.findOneAndUpdate(
        { hostname: hostname },
        { 
            selectedFilters: selectedFilters,
        },
        { upsert: true, new: true }
    );
}