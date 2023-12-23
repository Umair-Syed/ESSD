import { RequestHandler } from "express";
import { ServersMetaModel } from "../models/server-meta";
import ServerDataModel from "../models/server-data";


export const getServersMeta: RequestHandler = async (req, res) => {
    try {
        // If ever use it, don't expose the passwords
        const serversMeta = await ServersMetaModel.find().exec();
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
    usernameSSH: string,
    passwordSSH: string,
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
        usernameSSH,
        passwordSSH,
        showDatabaseInfo,
        databaseServerHost,
        databaseUsername,
        databasePassword,
        selectedDatabases,
        selectedFilters,
    } = req.body;

    try {
        await ServersMetaModel.create({
            hostname,
            isCluster,
            nodesHostnames, // will be empty if isCluster is false
            userName2443,
            password2443,
            usernameSSH,
            passwordSSH,
            showDatabaseInfo,
            databaseServerHost, // will be empty if showDatabaseInfo is false
            databaseUsername, // will be empty if showDatabaseInfo is false
            databasePassword, // will be empty if showDatabaseInfo is false
            selectedDatabases, // will be empty if showDatabaseInfo is false
            selectedFilters,
        });

        const newServerData = await createServerDataWithHostnameAndFilters(hostname, selectedFilters);

        res.status(201).json(newServerData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

async function createServerDataWithHostnameAndFilters(hostname: string, selectedFilters: string[]) {
    /*
        Will create a new server data document in serversdatas collection, with the hostname and filters.
        Rest of the fields will be created later when CRON task will run or when refresh API endpoint hit.
    */
    const updatedDocument = await ServerDataModel.findOneAndUpdate(
        { hostname: hostname },
        {
            selectedFilters: selectedFilters,
        },
        { upsert: true, new: true }
    );

    return updatedDocument;
}


type IUpdateServerMetaBody = {
    hostname: string,
    selectedFilters: string[],
}

export const updateServerMeta: RequestHandler<unknown, unknown, IUpdateServerMetaBody, unknown> = async (req, res) => {
    const { hostname, selectedFilters } = req.body;
    console.log(`$$$$Updating server meta for hostname: ${hostname}...filters: ${selectedFilters.join(", ")}}`);
    try {
        await ServersMetaModel.findOneAndUpdate(
            { hostname: hostname },
            {
                selectedFilters: selectedFilters,
            }
        );

        // Now updating server data document
        const updatedServerData = await createServerDataWithHostnameAndFilters(hostname, selectedFilters);

        res.status(201).json(updatedServerData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}
