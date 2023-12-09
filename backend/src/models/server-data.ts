import { InferSchemaType, Schema, model } from "mongoose";

const serversDataSchema = new Schema({
    hostname: { type: String, required: true },
    services: { type: Schema.Types.Mixed },
    diskUsages: { type: [Number] }, // Array of disk usage of past x mins taken every y mins
    memoryUsages: { type: [Number] }, // Array of memory usage of past x mins taken every y mins
    databaseConnection: {
        type: {
            activeConnections: Number,
        }
    }

}, { timestamps: true });

type IServersDataSchema = InferSchemaType<typeof serversDataSchema>;

export default model<IServersDataSchema>("ServersData", serversDataSchema);