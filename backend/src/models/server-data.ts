import { InferSchemaType, Schema, model } from "mongoose";


const serviceStatusSchema = new Schema({
    name: { type: String }, // Name of the service
    nodes: [{ 
        nodeName: String,
        status: String
    },{ _id: false }]
},{ _id: false });

const serversDataSchema = new Schema({
    hostname: { type: String, required: true },
    services: [serviceStatusSchema], // Array of services
    diskUsages: [Number], // Array of disk usage
    memoryUsages: [Number], // Array of memory usage
    databaseConnection: {
        activeConnections: Number
    }
}, { timestamps: true });



type IServersDataSchema = InferSchemaType<typeof serversDataSchema>;

export default model<IServersDataSchema>("ServersData", serversDataSchema);