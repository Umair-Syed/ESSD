export interface IServiceStatus {
    name: string; // Name of the service
    nodes: Array<{
        nodeName: string;
        status: string;
    }>;
}

interface IProcessesStatusForNode {
    nodeName: string;
    processesStatus: Array<{
        name: string; // Name of the process
        status: string;
    }>;
}

export interface IDiskUsageForNode {
    nodeName: string;
    past20MinUsage: number[];
    capacity: number;
    timestamps: number[];
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
    timestamps: number[];
}

export interface IDatabaseStatus {
    databaseName: string;
    status: string;
}

export interface ServerData {
    _id: string;
    hostname: string;
    alias: string;
    services: IServiceStatus[];
    supervisorctlStatus: IProcessesStatusForNode[]; // Will have only one element for non-cluster servers
    diskUsages: IDiskUsageForNode[]; // Will have only one element for non-cluster servers
    memoryPressure: IMemoryPressureForNode[]; // Will have only one element for non-cluster servers
    databaseStatus: IDatabaseStatus[];
    selectedFilters: string[]; // For tags
    serverVersion: string;
    isCluster: boolean;
    showDatabaseInfo: boolean;
    nodesHostnames: string[];
    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}
