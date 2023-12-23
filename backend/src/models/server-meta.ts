import { InferSchemaType, Schema, model } from "mongoose";

const serversMetaSchema = new Schema({
    hostname: { type: String, required: true },
    isCluster: { type: Boolean, required: true },
    nodesHostnames: { type: [String] },
    userName2443: { type: String, required: true },
    password2443: { type: String, required: true },
    usernameSSH: { type: String, required: true },
    passwordSSH: { type: String, required: true },
    showDatabaseInfo: { type: Boolean, required: true },
    databaseServerHost: { type: String },
    databaseUsername: { type: String },
    databasePassword: { type: String },
    selectedDatabases: { type: [String] },
    selectedFilters: { type: [String] },
}, { timestamps: true });

type IServersMetaSchema = InferSchemaType<typeof serversMetaSchema>;

export const ServersMetaModel = model<IServersMetaSchema>("ServersMeta", serversMetaSchema);

export interface IServerMeta {
    hostname: string;
    isCluster: boolean;
    nodesHostnames: string[];
    userName2443: string;
    password2443: string;
    usernameSSH: string;
    passwordSSH: string;
    showDatabaseInfo: boolean;
    databaseServerHost: string;
    databaseUsername: string;
    databasePassword: string;
    selectedDatabases: string[];
    selectedFilters: string[];
}