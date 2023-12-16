import axiosInstance from '@/network/axiosInstance';
import { DatabaseResponse } from '@/models/database';

type IDatbaseConfig = {
    databaseServer: string,
    username: string,
    password: string,
}

export async function getDatabaseNames(input: IDatbaseConfig): Promise<DatabaseResponse> {
    const response = await axiosInstance.post<DatabaseResponse>('/databases', input);
    return response.data;
}