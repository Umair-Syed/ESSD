import { getDatabaseStatus, getDiskUsageStatus, getMemoryPressureStatus, getServicesStatus, getIndicatorColorFromStatus } from "@/util/getStatus";
import { ServerData } from '@/models/server-data';
import { FaHardDrive, FaMemory, FaDatabase } from "react-icons/fa6";
import { IoCellular } from "react-icons/io5";

interface IIndividualStatusIndicatorProps {
    serverData: ServerData;
    nodename: string;
    larger?: boolean;
}

export function DiskAndMemoryIndicator({ serverData, nodename }: IIndividualStatusIndicatorProps) {
    const memoryPressureStatus = getMemoryPressureStatus(serverData.memoryPressure, nodename).status;
    const diskUsageStatus = getDiskUsageStatus(serverData.diskUsages, nodename).status;

    const memoryIndicatorColor = getIndicatorColorFromStatus(memoryPressureStatus);
    const diskIndicatorColor = getIndicatorColorFromStatus(diskUsageStatus);

    return (
        <div className='flex gap-4 text-lg mr-2'>
            <FaHardDrive className={diskIndicatorColor} />
            <FaMemory className={memoryIndicatorColor} />
        </div>
    );
}

export function DiskUsageIndicator({ serverData, nodename, larger=false  }: IIndividualStatusIndicatorProps) {
    const diskUsageStatus = getDiskUsageStatus(serverData.diskUsages, nodename).status;
    const diskIndicatorColor = getIndicatorColorFromStatus(diskUsageStatus);

    return (
        <div className={`${larger ? "text-xl" : "text-lg"} mr-2`}>
            <FaHardDrive className={diskIndicatorColor} />
        </div>
    );
}

export function MemoryPressureIndicator({ serverData, nodename, larger=false  }: IIndividualStatusIndicatorProps) {
    const memoryPressureStatus = getMemoryPressureStatus(serverData.memoryPressure, nodename).status;
    const memoryIndicatorColor = getIndicatorColorFromStatus(memoryPressureStatus);

    return (
        <div className={`${larger ? "text-xl" : "text-lg"} mr-2`}>
            <FaMemory className={memoryIndicatorColor} />
        </div>
    );
}

export function DatabaseStatusIndicator({ serverData, nodename, larger=false  }: IIndividualStatusIndicatorProps) {
    const databaseStatus = getDatabaseStatus(serverData.showDatabaseInfo, serverData.databaseStatus).status;

    const databaseIndicatorColor = getIndicatorColorFromStatus(databaseStatus);

    return (
        <div className={`${larger ? "text-xl" : "text-lg"} mr-2`}>
            <FaDatabase className={databaseIndicatorColor} />
        </div>
    );
}

export function ServicesStatusIndicator({ serverData, nodename, larger=false }: IIndividualStatusIndicatorProps) {
    const servicesStatus = getServicesStatus(serverData.services, nodename, serverData.alias).status;

    const servicesIndicatorColor = getIndicatorColorFromStatus(servicesStatus);

    return (
        <div className={`${larger ? "text-xl" : "text-lg"} mr-2`}>
            <IoCellular className={servicesIndicatorColor} />
        </div>
    );
}