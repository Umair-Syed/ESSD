export interface IServiceStatus {
    name: string; // Name of the service
    nodes: Array<{
        nodeName: string;
        status: string;
    }>;
}

export interface IDiskUsageForNode {
    nodeName: string;
    past20MinUsage: number[];
    capacity: number;
}

export interface IMemoryPressureForNode {
    nodeName: string;
    memory: {
        total: number;
        used: number[];
    };
    swap: {
        total: number;
        used: number[];
    };
}

export interface IDatabaseStatus {
    databaseName: string;
    status: string;
}

export interface ServerData {
    _id: string;
    hostname: string;
    services: IServiceStatus[];
    diskUsages: IDiskUsageForNode[]; // Will have only one element for non-cluster servers
    memoryPressure: IMemoryPressureForNode[]; // Will have only one element for non-cluster servers
    databaseStatus: IDatabaseStatus[];
    selectedFilters: string[]; // For tags
    serverVersion: string;
    isCluster: boolean;
    showDatabaseInfo: boolean;
    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}
