import { InferSchemaType, Schema, model } from "mongoose";

const serversMetaSchema = new Schema({
    hostname: { type: String, required: true },
    isCluster: { type: Boolean, required: true },
    nodesHostnames: { type: [String] },
    userName2443: { type: String, required: true },
    password2443: { type: String, required: true },
}, { timestamps: true });

type IServersMetaSchema = InferSchemaType<typeof serversMetaSchema>;

export default model<IServersMetaSchema>("ServersMeta", serversMetaSchema);