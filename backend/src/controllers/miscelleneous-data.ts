import { RequestHandler } from "express";
import MiscellaneousDataModel from "../models/miscelleneous-data";

export const getAllFilters: RequestHandler = async (req, res) => {
    try {
        const filters = await MiscellaneousDataModel.findOne().select('filters');
        res.status(200).json(filters);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}

type IAddFilterBody = {
    filter: string;
}

export const addFilter: RequestHandler<unknown, unknown, IAddFilterBody, unknown> = async (req, res) => {
    const { filter } = req.body;
    try {
        const newFilterItem = { filter: filter };
        const updatedDocument = await MiscellaneousDataModel.findOneAndUpdate({}, 
            { $push: { filters: newFilterItem } },
            { new: true, upsert: true });
        res.status(201).json(updatedDocument);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}

export const deleteFilter: RequestHandler<{ filter: string }> = async (req, res) => {
    const { filter } = req.params;

    try {
        const updatedDocument = await MiscellaneousDataModel.findOneAndUpdate(
            {}, 
            { $pull: { filters: { filter: filter } } },
            { new: true }
        );

        if (updatedDocument) {
            res.status(200).json(updatedDocument);
        } else {
            res.status(404).json({ message: "Document not found or filter not found in the document" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}