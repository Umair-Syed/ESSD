import { RequestHandler } from "express";
import ServerMetaModel  from "../models/server-meta";


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
        });

        res.status(201).json(newServerMeta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}