import { RequestHandler } from "express";
import { ServersMetaModel } from "../models/server-meta";
import ServerDataModel from "../models/server-data";
import { getAliasHostname } from "../util";

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

// will add a new server meta document in serversmeta collection and a new server data document with only few fields in serversdatas collection.
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

        const existingServer = await ServersMetaModel.findOne({ hostname });
        if (existingServer) {
            return res.status(409).json({ message: "Server with this hostname already exists." });
        } else {
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
    
            const newServerData = await createServerDataWithInitialData(hostname, selectedFilters, isCluster, showDatabaseInfo, nodesHostnames, usernameSSH, passwordSSH);
    
            res.status(201).json(newServerData);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


async function createServerDataWithInitialData(
    hostname: string,
    selectedFilters: string[],
    isCluster: boolean,
    showDatabaseInfo: boolean,
    nodesHostnames: string[],
    usernameSSH: string,
    passwordSSH: string,
) {
    /*
        CANNOT TAKE TIME HERE. Have to SEND BACK THE RESPONSE with initial data ASAP.
        Will create a new server data document in serversdatas collection, with the hostname and filters.
        Rest of the fields will be created later when CRON task will run or when refresh API endpoint hit.
    */

    
    let alias = "";
    if (!isCluster) {
        alias = await getAliasHostname(hostname, usernameSSH, passwordSSH); // timeout only 1 second
    }   

    const updatedDocument = await ServerDataModel.findOneAndUpdate(
        { hostname: hostname },
        {
            selectedFilters: selectedFilters,
            isCluster: isCluster,
            showDatabaseInfo: showDatabaseInfo,
            nodesHostnames: nodesHostnames,
            alias: alias !== hostname ? alias : "",
        },
        { upsert: true, new: true }
    );

    return updatedDocument;
}


type IUpdateServerMetaBody = {
    hostname: string,
    selectedFilters: string[],
}

// Will update corresponding server data document as well
export const updateServer: RequestHandler<unknown, unknown, IUpdateServerMetaBody, unknown> = async (req, res) => {
    const { hostname, selectedFilters } = req.body;
    try {
        await ServersMetaModel.findOneAndUpdate(
            { hostname: hostname },
            {
                selectedFilters: selectedFilters,
            }
        );

        // Now updating server data document
        const updatedServerData = await updateServerData(hostname, selectedFilters);

        res.status(201).json(updatedServerData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

async function updateServerData(hostname: string, selectedFilters: string[],) {
    const updatedDocument = await ServerDataModel.findOneAndUpdate(
        { hostname: hostname },
        {
            selectedFilters: selectedFilters,
        },
        { upsert: true, new: true }
    );

    return updatedDocument;
}


// Deletes both server meta and server data documents
export const deleteServer: RequestHandler = async (req, res) => {
    const { hostname } = req.params;
    try {
        await ServersMetaModel.deleteOne({ hostname: hostname });
        const isDeleted = await ServerDataModel.deleteOne({ hostname: hostname });
        res.status(200).json(isDeleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}