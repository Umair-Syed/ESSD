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
import { RiRadioButtonLine } from "react-icons/ri";
import { MdEdit, MdDelete, MdError } from "react-icons/md";
import { Dropdown, Tooltip } from 'flowbite-react';
import styles from './page.module.css';
import AddServerModal from "@/components/AddServerModal";
import WarningModal from "@/components/WarningModal";
import MemoryChart from "@/components/MemoryChart";
import DiskChart from "@/components/DiskChart";
import { getDatabaseStatus, getDiskUsageStatus, getMemoryPressureStatus, getServicesStatus } from "@/util/getStatus";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
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
        toast.success(`Server ${server.hostname} deleted successfully`, {
          position: "bottom-left",
          autoClose: 3000,
        });
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
        <div>
          <div className='flex items-baseline'>
            <div className='font-medium text-xl text-gray-700'>{serverData.hostname}</div>
            <div className='text-sm font-semibold text-gray-400 ml-4'>{serverData.serverVersion}</div>
            <div className='ml-4 border rounded-md px-2'>
              <a className='text-sm hover:text-[#003E43] font-bold text-[#003E43]/[.40]'
                href={`https://${server.hostname}:8443`}
                target="_blank"
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                EM
              </a>
              <a className='ml-4 text-sm hover:text-[#E7478B] font-bold text-[#E7478B]/[.40]'
                href={`https://${server.hostname}:2443/kibana4/app/kibana`}
                target="_blank"
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                K
              </a>
              <a className='ml-4 text-sm hover:text-[#F15F29] font-bold text-[#F15F29]/[.40]'
                href={`https://${server.hostname}:9091`}
                target="_blank"
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                OF
              </a>
            </div>
          </div>

          {serverData.alias !== "" && (
            <div className='text-sm text-gray-400'>{serverData.alias}</div>
          )}
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
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedServer === serverData.hostname ? "h-[520px]" : "h-0"}`}>
        {expandedServer === serverData.hostname &&
          <div className={`mt-4 pt-4 border-t overflow-y-auto pr-4`} style={{ maxHeight: "520px" }}>  {/* Adjust maxHeight as needed */}
            {/* Display the expanded data here */}
            {/* Disk and Memory status */}
            <div className='border-2 rounded-md pb-2'>
              <div className='flex justify-between bg-gray-200 px-2 py-2'>
                <h1 className='text-gray-600'>Disk and Memory usage</h1>
                <div>
                  <DiskAndMemoryIndicator serverData={serverData} nodename={serverData.hostname} />
                </div>
              </div>
              <div className='flex mt-2'>
                <div style={{ width: '500px', }}>
                  <DiskChart {...serverData.diskUsages[0]} />
                </div>
                <div style={{ width: '500px', }} className='ml-6'>
                  <MemoryChart {...serverData.memoryPressure[0]} />
                </div>
              </div>
            </div>
            {/* Databases status */}
            {serverData.showDatabaseInfo &&
              <div className='border-2 rounded-md pb-2 mt-8'>
                <div className='flex justify-between bg-gray-200 px-2 py-2'>
                  <h1 className='text-gray-600'>Database status</h1>
                  <div>
                    <DatabaseStatusIndicator serverData={serverData} nodename={serverData.hostname} />
                  </div>
                </div>
                <div className='mt-4'>
                  {serverData.databaseStatus.length > 0 ? (serverData.databaseStatus.map((database) => (
                    <div key={database.databaseName} className='flex justify-between px-4'>
                      <div className='text-lg text-gray-700 mb-2'>{database.databaseName}</div>
                      <div className='text-sm text-green-600 font-bold'>{database.status}</div>
                    </div>
                  ))) :
                    <div className='flex justify-center text-gray-500 py-8 items-center gap-2'>
                      <div>Couldn't fetch databases status. Looks like database server is down.</div>
                      <div className='text-xl'><MdError className='text-red-400' /></div>
                    </div>
                  }
                </div>
              </div>
            }
            {/* Services status */}
            <ServicesDetails serverData={serverData} nodename={serverData.hostname} />
          </div>
        }
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
  const servicesStatus = getServicesStatus(serverData.services, nodename, serverData.alias).status;
  const databaseStatus = getDatabaseStatus(serverData.showDatabaseInfo, serverData.databaseStatus).status;
  const memoryPressureStatus = getMemoryPressureStatus(serverData.memoryPressure, nodename).status;
  const diskUsageStatus = getDiskUsageStatus(serverData.diskUsages, nodename).status;

  const servicesIndicatorColor = getIndicatorColorFromStatus(servicesStatus, isRefreshing);
  const databaseIndicatorColor = getIndicatorColorFromStatus(databaseStatus, isRefreshing);
  const memoryIndicatorColor = getIndicatorColorFromStatus(memoryPressureStatus, isRefreshing);
  const diskIndicatorColor = getIndicatorColorFromStatus(diskUsageStatus, isRefreshing);

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


function getIndicatorColorFromStatus(status: string, isRefreshing?: boolean) {
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

interface IIndividualStatusIndicatorProps {
  serverData: ServerData;
  nodename: string;
}

function DiskAndMemoryIndicator({ serverData, nodename }: IIndividualStatusIndicatorProps) {
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

function DatabaseStatusIndicator({ serverData, nodename }: IIndividualStatusIndicatorProps) {
  const databaseStatus = getDatabaseStatus(serverData.showDatabaseInfo, serverData.databaseStatus).status;

  const databaseIndicatorColor = getIndicatorColorFromStatus(databaseStatus);

  return (
    <div className='text-lg mr-2'>
      <FaDatabase className={databaseIndicatorColor} />
    </div>
  );
}

function ServicesStatusIndicator({ serverData, nodename }: IIndividualStatusIndicatorProps) {
  const servicesStatus = getServicesStatus(serverData.services, nodename, serverData.alias).status;

  const servicesIndicatorColor = getIndicatorColorFromStatus(servicesStatus);

  return (
    <div className='text-lg mr-2'>
      <IoCellular className={servicesIndicatorColor} />
    </div>
  );
}


interface IServicesDetailsProps {
  serverData: ServerData;
  nodename: string;
}

function ServicesDetails({ serverData, nodename }: IServicesDetailsProps) {
  const couldntFetchServices = serverData.services.length === 0;
  const servicesStatusArray: { name: string, status: "UP" | "DOWN" }[] = [];
  if (!couldntFetchServices) {
    for (let service of serverData.services) {
      if (service.nodes.length === 0) {
        // If there are no nodes data, the service is down
        servicesStatusArray.push({ name: service.name, status: "DOWN" });
      } else {
        for (let node of service.nodes) {
          if ((node.nodeName === nodename || node.nodeName === serverData.alias) && node.status.toUpperCase() === "DOWN") {
            servicesStatusArray.push({ name: service.name, status: "DOWN" });
          } else if ((node.nodeName === nodename || node.nodeName === serverData.alias) && node.status.toUpperCase() === "UP") {
            servicesStatusArray.push({ name: service.name, status: "UP" });
          }
        }
      }
    }
  }

  return (
    <div className='border-2 rounded-md pb-2 mt-8 mb-8'>
      <div className='flex justify-between bg-gray-200 px-2 py-2'>
        <h1 className='text-gray-600'>Services Status</h1>
        <div>
          <ServicesStatusIndicator serverData={serverData} nodename={serverData.hostname} />
        </div>
      </div>
      <div className='mt-4'>
        {couldntFetchServices ?
          <div className='flex justify-center text-gray-500 py-8 items-center gap-2'>
            <div>Couldn't fetch services status. Looks like server is down  </div>
            <div className='text-xl'><MdError className='text-red-400' /></div>
          </div>
          :
          servicesStatusArray.map((service, index) => (
            <div
              key={service.name}
              className={`flex justify-between items-center px-4 py-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className='text-lg text-gray-700'>{service.name}</div>
              <div className='text-xl'>
                {service.status === "UP" ? <RiRadioButtonLine className='text-green-500' /> : <RiRadioButtonLine className='text-red-500' />}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}