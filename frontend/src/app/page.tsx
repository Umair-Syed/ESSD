'use client';
import { useEffect, useState } from 'react';
import { getServersDataForFilter, getAllServersData, getRefreshedServersDataForHostName } from '@/network/api/serversDataApis';
import { deleteServer } from '@/network/api/serversMetaApis';
import { ServerData } from '@/models/server-data';
import { useSelectedFilter } from '@/contexts/SelectedFilterContext';
import { useServersData } from '@/contexts/ServersDataContext';
import { IoIosArrowDown, IoIosArrowUp, IoMdMore } from "react-icons/io";
import { FaHardDrive, FaMemory, FaDatabase } from "react-icons/fa6";
import { IoCellular } from "react-icons/io5";
import { LuRefreshCcw } from "react-icons/lu";
import { FaExternalLinkAlt } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { Dropdown, Tooltip } from 'flowbite-react';
import styles from './page.module.css';
import AddServerModal from "@/components/AddServerModal";
import WarningModal from "@/components/WarningModal";
import MemoryChart from "@/components/MemoryChart";
import { getDatabaseStatus, getDiskUsageStatus, getMemoryPressureStatus, getServicesStatus } from "@/util/getStatus";

export default function Home() {
  const { selectedFilter } = useSelectedFilter();
  const { serversData, setServersData } = useServersData();
  const [expandedServer, setExpandedServer] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedFilter === "All servers") {
        const allServersData = await getAllServersData();
        console.log(`data: ${JSON.stringify(allServersData)}`);
        setServersData(allServersData);
      } else {
        const filteredServersData = await getServersDataForFilter(selectedFilter);
        setServersData(filteredServersData);
      }
    };

    fetchData();
  }, [selectedFilter]);

  const toggleExpand = (serverHostname: string) => {
    setExpandedServer(expandedServer === serverHostname ? null : serverHostname);
  };

  return (
    <div className="p-4 xl:mx-64 lg:mx-32 md:mx-12">
      {serversData.length > 0 ? serversData.map((server) => (
        <RowItem key={server.hostname} server={server} setServersData={setServersData} serversData={serversData} toggleExpand={toggleExpand} expandedServer={expandedServer} />
      )) : (
        <div className="text-center text-gray-500 font-bold text-xl">No servers found</div>
      )}
    </div>
  );
}

interface IRowItemProps {
  server: ServerData; // current item server data. Use serverData state instead 
  serversData: ServerData[];
  setServersData: (serversData: ServerData[]) => void;
  toggleExpand: (serverHostname: string) => void;
  expandedServer: string | null;
}

function RowItem({ server, serversData, setServersData, toggleExpand, expandedServer }: IRowItemProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverData, setServerData] = useState<ServerData>(server); // initial value is the server data passed in. Using hook so that can update the data when refreshing.
  const [showEditServerModal, setShowEditServerModal] = useState(false);
  const [showServerDeleteModal, setShowServerDeleteModal] = useState(false);




  useEffect(() => {
    // server.createdAt is within last 5mins (usually cron job interval) and is empty, then refresh data for it. Refreshing because it's a newly added server and new servers don't have all the data.
    if (server.createdAt) {
      const createdAtDate = new Date(server.createdAt);
      const createdAtTime = createdAtDate.getTime();
      const tenSecondsAgo = Date.now() - 300000;

      const isNewServer = (createdAtTime >= tenSecondsAgo && server.services.length === 0 && server.serverVersion.length === 0);

      if (isNewServer) {
        refreshServerData();
      }
    }
  }, []);

  const refreshServerData = async () => {
    setIsRefreshing(true);
    try {
      const currentServerData = await getRefreshedServersDataForHostName(server.hostname);
      setServerData(currentServerData); // only for current server, not whole serversData
    } catch (error) {
      console.error(error);
    }

    setIsRefreshing(false);
  };

  const handleDeleteServer = async () => {
    try {
      const deleteResponse = await deleteServer(server.hostname);
      if (deleteResponse.data.deletedCount > 0) {

        // remove the server from the serversData
        const updatedServersData = serversData.filter((serverData) => serverData.hostname !== server.hostname);
        setServersData(updatedServersData);
        alert(`Server ${server.hostname} deleted successfully`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      key={serverData.hostname}
      className={`border py-6 px-6 mb-2 rounded-md border-gray-300 bg-white shadow-sm ${expandedServer ? "hover:bg-white" : "hover:bg-gray-50"}`}
    >
      <div
        className="flex justify-between items-center md:flex-row sm:flex-col cursor-pointer"
        onClick={() => toggleExpand(serverData.hostname)}>

        {/* Hostname, Link, Version */}
        <div className='flex items-baseline'>
          <div className='font-medium text-xl text-gray-600'>{serverData.hostname}</div>
          <a className='text-sm text-gray-400 ml-4 hover:text-blue-500'
            href={`https://${server.hostname}:8443`}
            target="_blank"
            onClick={(e) => {
              e.stopPropagation();
            }}>
            <FaExternalLinkAlt />
          </a>
          <div className='text-sm text-gray-400 font-light ml-4'>{serverData.serverVersion}</div>
        </div>

        <div className='flex items-center text-xl'>
          {/* Refresh */}
          <button
            className={`mr-4 text-gray-700 w-5 h-5 hover:text-blue-500 ${isRefreshing ? styles.rotate : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              refreshServerData();
            }}>
            <LuRefreshCcw />
          </button>

          {/* icons */}
          {!serverData.isCluster &&
            <StatusIndicators
              isRefreshing={isRefreshing}
              serverData={serverData}
              nodename={serverData.hostname}
            />
          }

          {/* More */}
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Dropdown
              label=""
              className='z-100 shadow-lg border-2 border-gray-300'
              renderTrigger={() =>
                <div
                  className='mr-2 text-gray-700 w-5 h-5 hover:text-blue-500'
                >
                  <IoMdMore />
                </div>
              }>
              <Dropdown.Item onClick={() => {
                setShowEditServerModal(true);
              }}>
                <div className='flex items-center gap-4 justify-between'>
                  <MdEdit className='w-4 h-4' />
                  <span>Edit</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setShowServerDeleteModal(true);
              }}>
                <div className='flex items-center gap-4 justify-between'>
                  <MdDelete className='w-4 h-4' />
                  <span>Delete</span>
                </div>
              </Dropdown.Item>
            </Dropdown>
          </div>

          {/* Expand icon */}
          {expandedServer === serverData.hostname ? (
            <IoIosArrowUp className="w-6 h-6" />
          ) : (
            <IoIosArrowDown className="w-5 h-5" />
          )}
        </div>
      </div>
      {serverData.isCluster && (
        <div className='mt-4'>
          {serverData.nodesHostnames.map((nodename) => (
            <div className='flex justify-between mt-2'>
              <div className='text-lg text-gray-500'>{nodename}</div>
              <StatusIndicators
                isRefreshing={isRefreshing}
                serverData={serverData}
                nodename={nodename} />
            </div>
          ))}
        </div>
      )}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedServer === serverData.hostname ? "max-h-[520px]" : "max-h-0"}`}>
        <div className={`mt-4 pt-4 border-t overflow-y-auto`} style={{ maxHeight: "520px" }}>  {/* Adjust maxHeight as needed */}
          {/* Display the expanded data here */}
          <div className='flex'>
            <div style={{ width: '500px', }}>
              <MemoryChart {...serverData.memoryPressure[0]}/>
            </div>
            <div style={{ width: '500px', }}>
              {/* <MemoryChart /> */}
            </div>
          </div>

        </div>
      </div>

      {showEditServerModal && (
        <div onClick={(e) => { e.stopPropagation() }}>
          <AddServerModal
            showModal={showEditServerModal}
            setShowModal={setShowEditServerModal}
            server={serverData}
            isEdit={true}
          />
        </div>
      )}
      {showServerDeleteModal &&
        <div onClick={(e) => { e.stopPropagation() }}>
          <WarningModal
            openModal={showServerDeleteModal}
            setOpenModal={setShowServerDeleteModal}
            description={`Are you sure you want to delete ${server.hostname}'s all data?`}
            onConfirm={() => handleDeleteServer()}
          />
        </div>
      }
    </div>
  );
}

interface IStatusIndicatorsProps {
  isRefreshing: boolean;
  serverData: ServerData;
  nodename: string;
}

function StatusIndicators({ isRefreshing, serverData, nodename }: IStatusIndicatorsProps) {
  const servicesStatus = getServicesStatus(serverData.services, nodename).status;
  const databaseStatus = getDatabaseStatus(serverData.showDatabaseInfo, serverData.databaseStatus).status;
  const memoryPressureStatus = getMemoryPressureStatus(serverData.memoryPressure, nodename).status;
  const diskUsageStatus = getDiskUsageStatus(serverData.diskUsages, nodename).status;

  const servicesIndicatorColor = getIndicatorColorFromStatus(isRefreshing, servicesStatus);
  const databaseIndicatorColor = getIndicatorColorFromStatus(isRefreshing, databaseStatus);
  const memoryIndicatorColor = getIndicatorColorFromStatus(isRefreshing, memoryPressureStatus);
  const diskIndicatorColor = getIndicatorColorFromStatus(isRefreshing, diskUsageStatus);

  const servicesTooltipContent = getIndicatorTooltipContent(servicesStatus, "services");
  const databaseTooltipContent = getIndicatorTooltipContent(databaseStatus, "database");
  const memoryTooltipContent = getIndicatorTooltipContent(memoryPressureStatus, "memory");
  const diskTooltipContent = getIndicatorTooltipContent(diskUsageStatus, "disk");

  return (
    <div className='flex items-center gap-4 mr-4 border py-2 px-4 rounded-md bg-gray-100'>
      {serverData.showDatabaseInfo &&
        <Tooltip content={databaseTooltipContent}>
          <FaDatabase className={databaseIndicatorColor} />
        </Tooltip>
      }
      <Tooltip content={diskTooltipContent}>
        <FaHardDrive className={diskIndicatorColor} />
      </Tooltip>
      <Tooltip content={memoryTooltipContent}>
        <FaMemory className={memoryIndicatorColor} />
      </Tooltip>
      <Tooltip content={servicesTooltipContent}>
        <IoCellular className={servicesIndicatorColor} />
      </Tooltip>
    </div>
  );
}


function getIndicatorColorFromStatus(isRefreshing: boolean, status: string) {
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

function getIndicatorTooltipContent(status: string, about: string) {
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

