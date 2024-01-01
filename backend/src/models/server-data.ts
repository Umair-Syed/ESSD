import { InferSchemaType, Schema, model } from "mongoose";


const serviceStatusSchema = new Schema({
    name: { type: String }, // Name of the service
    nodes: [{ 
        nodeName: String,
        status: String
    },{ _id: false }]
},{ _id: false });

// past20MinUsage: keeps the last 20 minutes of disk usage data, with 2 minute interval, so there will be 10 elements always
const diskUsageForNode = new Schema({
    nodeName: String,
    past20MinUsage: [Number],
    capacity: Number,
    timestamps: [Number]
},{ _id: false });

const memoryPressureForNode = new Schema({
    nodeName: String,
    memory: {
        total: Number,
        used: [Number],
    },
    swap: {
        total: Number,
        used: [Number],
    },
    timestamps: [Number]
},{ _id: false });

const databaseStatus = new Schema({
    databaseName: String,
    status: String
},{ _id: false });

const serversDataSchema = new Schema({
    hostname: { type: String, required: true },
    alias: { type: String, default: "" },
    services: [serviceStatusSchema],
    diskUsages: [diskUsageForNode], // will have only one element for non-cluster servers
    memoryPressure: [memoryPressureForNode], // will have only one element for non-cluster servers
    databaseStatus: [databaseStatus],
    selectedFilters: { type: [String] }, // for tags
    serverVersion: { type: String, default: "" },
    isCluster: { type: Boolean, required: true },
    showDatabaseInfo: { type: Boolean, required: true },
    nodesHostnames: { type: [String] },
}, { timestamps: true });



type IServersDataSchema = InferSchemaType<typeof serversDataSchema>;

export default model<IServersDataSchema>("ServersData", serversDataSchema);