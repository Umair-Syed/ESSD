import { ServerMeta } from '@/models/server-meta';
import { ServerData } from '@/models/server-data';
import axiosInstance from '@/network/axiosInstance';
import { AxiosResponse } from 'axios';

type ICreateServerInfoValues = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    usernameSSH: string,
    passwordSSH: string,
    showDatabaseInfo: boolean,
    databaseServerHost: string,
    databaseUsername: string,
    databasePassword: string,
    selectedDatabases: string[],
    selectedFilters: string[],
}

export async function addServerMetaInfo(input: ICreateServerInfoValues): Promise<AxiosResponse<ServerData, any>> {
    const response = await axiosInstance.post<ServerData>('/servers-meta', input);
    return response;
}


type IUpdateServerInfoValues = {
    hostname: string,
    selectedFilters: string[],
}
// for now letting only update the filters. Later can implement update for other fields.
export async function updateServerMetaInfo(input: IUpdateServerInfoValues): Promise<AxiosResponse<ServerData, any>> {
    const response = await axiosInstance.put<ServerData>('/servers-meta', input);
    return response;
}