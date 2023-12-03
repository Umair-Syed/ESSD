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
}

export const createServerMeta: RequestHandler<unknown, unknown, ICreateServerMetaBody, unknown> = async (req, res) => {
    const {hostname, isCluster, nodesHostnames, userName2443, password2443} = req.body;

    try {
        const newServerMeta = await ServerMetaModel.create({
            hostname,
            isCluster,
            nodesHostnames, // check if isCluster
            userName2443,
            password2443,
        });

        res.status(201).json(newServerMeta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}