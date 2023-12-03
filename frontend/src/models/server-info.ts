export interface ServerInfo {
    _id: string,
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    createdAt: string,
    updatedAt: string,
}