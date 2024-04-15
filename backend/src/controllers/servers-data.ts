import { RequestHandler } from "express";
import ServerDataModel from "../models/server-data";
import updateServicesDataTask from '../services/tasks/servicesTask';
import updateDatabaseDataTask from '../services/tasks/databaseTask';
import updateDiskUsageDataTask from '../services/tasks/diskUsageTask';
import updateMemoryUsageDataTask from '../services/tasks/memoryUsageTask';
import updateServerInfoDataTask from '../services/tasks/serverInfoDataTask';
import updateSupervisorctlStatusTask from '../services/tasks/supervisorctlStatusTask';
import { ServersMetaModel, IServerMeta } from '../models/server-meta';


export const getAllServersData: RequestHandler = async (req, res) => {
    try {
        const serversData = await ServerDataModel.find().sort({createdAt : -1}).exec();
        res.status(200).json(serversData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


export const getRefreshedServersDataForHostName: RequestHandler = async (req, res) => {
    const hostname = req.params.hostname;
    console.log(`Refreshing data for hostname: ${hostname}`);
    try {
        // 1. refresh data for this hostname in db
        const server = await ServersMetaModel.findOne({ hostname: hostname });
        await updateServicesDataTask(server as IServerMeta); // need to use await, otherwise will simultaneously update same document
        await updateSupervisorctlStatusTask(server as IServerMeta);
        await updateDatabaseDataTask(server as IServerMeta);
        await updateDiskUsageDataTask(server as IServerMeta);
        await updateMemoryUsageDataTask(server as IServerMeta);
        await updateServerInfoDataTask(server as IServerMeta);
        // 2. get the refreshed data from db
        const serversData = await ServerDataModel.findOne({ hostname: hostname });
        res.status(200).json(serversData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


export const getServersDataForFilter: RequestHandler = async (req, res) => {
    // Expecting a comma-separated list of filters
    const filterQuery = req.query.filter;
    console.log(`Getting data for filters: ${filterQuery}`);
    if (!filterQuery || typeof filterQuery !== 'string') {
        return res.status(400).json({ message: "Filter query parameter is required and must be a comma-separated string" });
    }

    const filters = filterQuery.split(',');

    try {
        const filteredServersData = await ServerDataModel.find({
            selectedFilters: { $all: filters }
        }).sort({createdAt : -1});

        res.status(200).json(filteredServersData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}