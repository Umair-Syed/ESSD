import { RequestHandler } from "express";
import ServerDataModel  from "../models/server-data";


export const getServersData: RequestHandler = async (req, res) => {
    try {
        const serversData = await ServerDataModel.find().exec(); // filter as you need
        console.log(serversData);   
        res.status(200).json(serversData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}