import axiosInstance from '@/network/axiosInstance';
import { FiltersData } from '@/models/miscelleneous';

type IFilterInput = {
    filter: string;
}

export async function addFilter(input: IFilterInput): Promise<FiltersData> {
    const response = await axiosInstance.post<FiltersData>('/misc/filters', input);
    return response.data;
}

export async function getFilters(): Promise<FiltersData> {
    const response = await axiosInstance.get<FiltersData>('/misc/filters');
    return response.data;
}

export async function deleteFilter(filter: string): Promise<FiltersData> {
    const response = await axiosInstance.delete<FiltersData>(`/misc/filters/${filter}`);
    return response.data;
}