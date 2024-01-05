import { ServerData } from '@/models/server-data';
import axiosInstance from '@/network/axiosInstance';


export async function getAllServersData(): Promise<ServerData[]> {
    const response = await axiosInstance.get<ServerData[]>('/servers-data');
    return response.data;
}

export async function getRefreshedServersDataForHostName(hostname: string): Promise<ServerData> {
    const response = await axiosInstance.get<ServerData>(`/servers-data/${hostname}`);
    return response.data;
}

export async function getServersDataForFilter(filters: string[]): Promise<ServerData[]> {
    const filterQuery = filters.join(',');
    const response = await axiosInstance.get<ServerData[]>(`/servers-data/filter?filter=${filterQuery}`);
    return response.data;
}