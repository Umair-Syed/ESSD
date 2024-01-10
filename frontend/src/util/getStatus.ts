import * as models from '@/models/server-data';
import { ST } from 'next/dist/shared/lib/utils';

const STATUS_UP = "UP";
const STATUS_DOWN = "DOWN";
const STATUS_UNKNOWN = "UNKNOWN";
const STATUS_WARNING = "WARNING";

interface IStatus {
    status: "UP" | "DOWN" | "WARNING" | "UNKNOWN"; // UNKNOWN is for example when can't get disk usage data, so can't determine if disk usage is high or not.
}

export function getServicesStatus(services: models.IServiceStatus[], nodename: string, alais: string): IStatus {
    let status: IStatus = {
        status: STATUS_UP
    };

    if (services.length === 0) {
        status.status = STATUS_DOWN;
        return status;
    }
    let servicesDownCount = 0;
    const downServices = [];
    for (let service of services) {
        if (service.nodes.length === 0) {
            // If there are no nodes data, the service is down
            servicesDownCount++;
            downServices.push(service.name);
        } else {
            for (let node of service.nodes) {
                if ((node.nodeName === nodename || node.nodeName === alais) && node.status.toUpperCase() === STATUS_DOWN) {
                    servicesDownCount++;
                    downServices.push(service.name);
                }
            }
        }
    }

    if (servicesDownCount !== 0 && servicesDownCount !== services.length) {
        status.status = STATUS_WARNING;
        return status;
    } else if (servicesDownCount === services.length) {
        status.status = STATUS_DOWN;
        return status;
    }

    return status;
}


export function getServicesStatusList(services: models.IServiceStatus[], nodename: string, alais: string): { status: string, downServices: string[], downCount: number} {

    if (services.length === 0) {
        return { status: STATUS_DOWN, downServices: [], downCount: -1}; // -1 means unknown
    }
    let servicesDownCount = 0;
    const downServices = [];
    for (let service of services) {
        if (service.nodes.length === 0) {
            // If there are no nodes data, the service is down
            servicesDownCount++;
            downServices.push(service.name);
        } else {
            for (let node of service.nodes) {
                if ((node.nodeName === nodename || node.nodeName === alais) && node.status.toUpperCase() === STATUS_DOWN) {
                    servicesDownCount++;
                    downServices.push(service.name);
                }
            }
        }
    }

    if (servicesDownCount !== 0 && servicesDownCount !== services.length) {
        return { status: STATUS_WARNING, downServices: downServices, downCount: servicesDownCount};
    } else if (servicesDownCount === services.length) {
        return { status: STATUS_DOWN, downServices: downServices, downCount: servicesDownCount};
    }

    return { status: STATUS_UP, downServices: downServices, downCount: servicesDownCount};
}


export function getDatabaseStatus(showDatabaseInfo: boolean, datbaseStatus: models.IDatabaseStatus[]): IStatus {
    let status: IStatus = {
        status: STATUS_UP
    };

    if (showDatabaseInfo === false) {
        status.status = STATUS_UNKNOWN;
        return status;
    }

    if (datbaseStatus.length === 0) {
        status.status = STATUS_UNKNOWN;
        return status;
    }

    let databaseDownCount = 0;
    for (let db of datbaseStatus) {
        if (db.status.toUpperCase() !== "ONLINE") {
            databaseDownCount++;
        }
    }

    if (databaseDownCount !== 0 && databaseDownCount !== datbaseStatus.length) {
        status.status = STATUS_WARNING;
        return status;
    } else if (databaseDownCount === datbaseStatus.length) {
        status.status = STATUS_DOWN;
        return status;
    }

    return status;
}


export function getDiskUsageStatus(diskUsages: models.IDiskUsageForNode[], nodename: string): IStatus {
    let status: IStatus = {
        status: STATUS_UP
    };

    if (diskUsages.length === 0) {
        status.status = STATUS_UNKNOWN;
        return status;
    }

    for (let diskUsage of diskUsages) {
        const capacity = diskUsage.capacity;
        const past20MinUsage = diskUsage.past20MinUsage;
        if (diskUsage.nodeName === nodename) {
            if (past20MinUsage.length === 0) {
                status.status = STATUS_UNKNOWN;
                return status;
            }
            // From server side, if we fail to get disk usage, we are returning -1.
            if (past20MinUsage[past20MinUsage.length - 1] === -1) {
                status.status = STATUS_UNKNOWN;
                return status;
            }
            if ((past20MinUsage[past20MinUsage.length - 1] / capacity) > 0.98) {
                // if disk usage is more than 98%, we consider it as down.
                status.status = STATUS_DOWN;
                return status;
            }
            if ((past20MinUsage[past20MinUsage.length - 1] / capacity) > 0.9) {
                // if disk usage is more than 90%, we consider it as warning.
                status.status = STATUS_WARNING;
                return status;
            }
        }
    }

    return status;
}


export function getMemoryPressureStatus(memoryPressures: models.IMemoryPressureForNode[], nodename: string): IStatus {
    let status: IStatus = {
        status: STATUS_UP
    };

    if (memoryPressures.length === 0) {
        status.status = STATUS_UNKNOWN;
        return status;
    }

    for (let memoryPressureOfNode of memoryPressures) {
        const totalMemory = memoryPressureOfNode.memory.total;
        const totalSwapMemory = memoryPressureOfNode.swap.total;
        const usedMemory = memoryPressureOfNode.memory.used;
        const usedSwapMemory = memoryPressureOfNode.swap.used;
        if (memoryPressureOfNode.nodeName === nodename) {
            if (usedMemory.length === 0 || usedSwapMemory.length === 0) {
                status.status = STATUS_UNKNOWN;
                return status;
            }
            // From server side, if we fail to get memory usage, we are returning -1.
            if (usedMemory[usedMemory.length - 1] === -1
                && usedSwapMemory[usedSwapMemory.length - 1] === -1) {

                status.status = STATUS_UNKNOWN;
                return status;
            }

            const memoryUsage = usedMemory[usedMemory.length - 1] / totalMemory;
            const swapUsage = usedSwapMemory[usedSwapMemory.length - 1] / totalSwapMemory;

            // if swap usage is more than 98% and memory usage is more than 98%, => Down
            if (swapUsage > 0.98
                && memoryUsage > 0.98) {
                status.status = STATUS_DOWN;
                return status;
            }

            // if swap usage is more than 98% and memory usage is more than 95%, => Warning
            if (swapUsage > 0.98
                && memoryUsage > 0.95) {
                status.status = STATUS_WARNING;
                return status;
            }

        }
    }

    return status;
}

export function getIndicatorColorFromStatus(status: string, isRefreshing?: boolean) {
    if (isRefreshing) {
        return "text-gray-400";
    }

    switch (status) {
        case "UP":
            return "text-green-600";
        case "DOWN":
            return "text-red-600";
        case "WARNING":
            return "text-yellow-400";
        default:
            return "text-gray-400";
    }
}

export function getIndicatorTooltipContent(status: string, about: string) {
    if (about === "services") {
        switch (status) {
            case "UP":
                return "All services are up and running";
            case "DOWN":
                return "Services are down";
            case "WARNING":
                return "Some services are down";
            case "UNKNOWN":
                return "Couldn't fetch services status";
            default:
                return "Unknown";
        }
    } else if (about === "database") {
        switch (status) {
            case "UP":
                return "All databases are online";
            case "DOWN":
                return "Databases are down";
            case "WARNING":
                return "Some databases are not online";
            case "UNKNOWN":
                return "Couldn't fetch databases status";
            default:
                return "Unknown";
        }
    } else if (about === "memory") {
        switch (status) {
            case "UP":
                return "Memory usage is normal.";
            case "DOWN":
                return "Memory usage is critically high.";
            case "WARNING":
                return "Memory usage is high.";
            case "UNKNOWN":
                return "Couldn't fetch memory status";
            default:
                return "Memory status is unknown.";
        }
    } else if (about === "disk") {
        switch (status) {
            case "UP":
                return "Disk usage is normal.";
            case "DOWN":
                return "Disk usage is critically high or disk not responding!";
            case "WARNING":
                return "Disk usage is high.";
            case "UNKNOWN":
                return "Couldn't fetch disk status";
            default:
                return "Disk status is unknown.";
        }
    }
}