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
    capacity: Number
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
},{ _id: false });

const serversDataSchema = new Schema({
    hostname: { type: String, required: true },
    services: [serviceStatusSchema],
    diskUsages: [diskUsageForNode], // will have only one element for non-cluster servers
    memoryPressure: [memoryPressureForNode], // will have only one element for non-cluster servers
    databaseConnection: {
        activeConnections: Number
    }
}, { timestamps: true });



type IServersDataSchema = InferSchemaType<typeof serversDataSchema>;

export default model<IServersDataSchema>("ServersData", serversDataSchema);