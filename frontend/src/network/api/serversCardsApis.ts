import { ServerInfo } from '@/models/server-info';
import axiosInstance from '@/network/axiosInstance';

type ICreateServerInfoValues = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    showDatabaseInfo: boolean,
    databaseServerHost: string,
    databaseUsername: string,
    databasePassword: string,
    selectedDatabases: string[],
}

export async function addServerMetaInfo(input: ICreateServerInfoValues): Promise<ServerInfo> {
    const response = await axiosInstance.post<ServerInfo>('/servers-meta', input);
    return response.data;
}