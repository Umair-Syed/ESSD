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
import { Dropdown } from 'flowbite-react';
import styles from './page.module.css';
import AddServerModal from "@/components/AddServerModal";
import WarningModal from "@/components/WarningModal";

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
      {serversData.map((server) => (
        <RowItem key={server.hostname} server={server} setServersData={setServersData} serversData={serversData} toggleExpand={toggleExpand} expandedServer={expandedServer} />
      ))}
    </div>
  );
}

interface IRowItemProps {
  server: ServerData; // current item server data
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
      onClick={() => toggleExpand(serverData.hostname)}>
      <div className="flex justify-between items-center md:flex-row sm:flex-col cursor-pointer">
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
          <button
            className={`mr-4 text-gray-700 w-5 h-5 hover:text-blue-500 ${isRefreshing ? styles.rotate : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              refreshServerData();
            }}>
            <LuRefreshCcw />
          </button>
          <div className='flex items-center gap-4 mr-4 border py-2 px-4 rounded-md bg-gray-100'>
            {/* icons */}
            <FaHardDrive className="text-green-600" />
            <FaMemory className="text-red-600" />
            <FaDatabase className="text-green-600" />
            <IoCellular className="text-green-600" />
          </div>
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

          {expandedServer === serverData.hostname ? (
            <IoIosArrowUp className="w-6 h-6" />
          ) : (
            <IoIosArrowDown className="w-5 h-5" />
          )}
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedServer === serverData.hostname ? "max-h-[520px]" : "max-h-0"}`}>
        <div className={`mt-4 pt-4 border-t overflow-y-auto`} style={{ maxHeight: "520px" }}>  {/* Adjust maxHeight as needed */}
          {/* Display the expanded data here */}
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
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