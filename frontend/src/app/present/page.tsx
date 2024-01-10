'use client';
import { useEffect, useState } from 'react';
import { getServersDataForFilter, getAllServersData } from '@/network/api/serversDataApis';
import { ServerData } from '@/models/server-data';
import { useSelectedFilter } from '@/contexts/SelectedFilterContext';
import { useServersData } from '@/contexts/ServersDataContext';
import { useSpring, animated } from 'react-spring';
import Carousel from 'react-grid-carousel';
import { getDatabaseStatus, getDiskUsageStatus, getMemoryPressureStatus, getServicesStatus, getIndicatorTooltipContent, getServicesStatusList } from "@/util/getStatus";
import { ServicesStatusIndicator, DatabaseStatusIndicator, DiskUsageIndicator, MemoryPressureIndicator } from "@/components/StatusIndicators";
import SmallDiskChart from '@/components/SmallDiskChart';
import SmallMemoryChart from '@/components/SmallMemoryChart';

export default function PresentPage() {
  const { selectedFilter } = useSelectedFilter();
  const { serversData, setServersData } = useServersData();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filteredServers, setFilteredServers] = useState(serversData);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      if (selectedFilter.includes("All servers")) {
        const allServersData = await getAllServersData();
        setServersData(allServersData);
      } else {
        const filteredServersData = await getServersDataForFilter(selectedFilter);
        setServersData(filteredServersData);
      }
      setIsLoadingData(false);
    };

    fetchData();
  }, [selectedFilter]);


  useEffect(() => {
    if (!Array.isArray(serversData)) return;
    setFilteredServers(serversData);
  }, [serversData]);


  useEffect(() => {
    const flipInterval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 3000);

    return () => clearInterval(flipInterval);
  }, []);


  const flipAnimation = useSpring({
    to: {
      opacity: 1,
      transform: `perspective(600px) rotateX(${flipped ? 180 : 360}deg)`,
    },
    from: {
      opacity: 0.5,
      transform: 'perspective(600px) rotateX(0deg)'
    },
    reset: false,
  });

  if (isLoadingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className='mt-8'>
      <Carousel cols={3} rows={2} gap={5} loop autoplay={5000} showDots={true} hideArrow={true}>
        {filteredServers.map((server, index) => (
          <Carousel.Item key={index}>
            <animated.div style={flipAnimation}>
              {flipped ? <CardBack data={server} /> : <CardFront data={server} />}
            </animated.div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}


interface CardProps {
  data: ServerData;
}

function CardFront({ data }: CardProps) {
  console.log(`getCardColor(data) = ${getCardColor(data)}`)
  const cardBGColorClass = `bg-${getCardColor(data)}/20`;
  return (
    <div className={`${cardBGColorClass} mx-4 my-4 px-6 py-6 border-4 border-${getCardColor(data)} rounded-xl flex-col items-center justify-center`}>
      <div className='flex justify-between items-center'>
        <div className='text-xl font-bold text-gray-700'>{data.hostname}</div>
        <div className='text-sm font-semibold text-gray-500'>{data.serverVersion}</div>
      </div>
      <div className='flex-col mt-4'>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Services status</div>
          <div className='flex gap-2'>
            {
              data.isCluster ? (data.nodesHostnames.map((nodename, index) => (
                <div key={index}>
                  <ServicesStatusIndicator serverData={data} nodename={nodename} larger={true} />
                </div>
              ))) : (
                <div>
                  <ServicesStatusIndicator serverData={data} nodename={data.hostname} larger={true} />
                </div>)
            }
          </div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Database status</div>
          <div className='flex gap-2'>
            {
              data.isCluster ? (data.nodesHostnames.map((nodename, index) => (
                <div key={index}>
                  <DatabaseStatusIndicator serverData={data} nodename={nodename} larger={true} />
                </div>
              ))) : (
                <div>
                  <DatabaseStatusIndicator serverData={data} nodename={data.hostname} larger={true} />
                </div>)
            }
          </div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Disk usage status</div>
          <div className='flex gap-2'>
            {
              data.isCluster ? (data.nodesHostnames.map((nodename, index) => (
                <div key={index}>
                  <DiskUsageIndicator serverData={data} nodename={nodename} larger={true} />
                </div>
              ))) : (
                <div>
                  <DiskUsageIndicator serverData={data} nodename={data.hostname} larger={true} />
                </div>)
            }
          </div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Memory usage status</div>
          <div className='flex gap-2'>
            {
              data.isCluster ? (data.nodesHostnames.map((nodename, index) => (
                <div key={index}>
                  <MemoryPressureIndicator serverData={data} nodename={nodename} larger={true} />
                </div>
              ))) : (
                <div>
                  <MemoryPressureIndicator serverData={data} nodename={data.hostname} larger={true} />
                </div>)
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBack({ data }: CardProps) {

  const servicesDetails = () => {
    const { status, downServices, downCount } =
      data.isCluster ?
        getServicesStatusList(data.services, data.nodesHostnames[0], data.alias) :
        getServicesStatusList(data.services, data.hostname, data.alias);

    if (status === "UP") {
      return <div className='text-lg font-semibold text-green-600'>All services up</div>;
    } else if (status === "WARNING") {
      return (
        <div className='max-w-xs text-base font-semibold text-red-600 overflow-hidden'>
          <div style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            animation: 'marquee 10s linear infinite'  // Adjust '10s' to control the speed
          }}>
            {downServices.join(', ')}
          </div>
        </div>
      );
    } else {
      return (
        <div className='text-lg font-semibold text-red-600'>
          Server down
        </div>
      );
    }
  };

  const databaseStatus = () => {
    let status = "ONLINE";
    if (data.showDatabaseInfo) {
      for (let currentDatabase of data.databaseStatus) {
        if (currentDatabase.status !== "ONLINE") {
          status = currentDatabase.status;
          break;
        }
      }
    } else {
      status = "UNKNOWN";
    }

    if (status === "ONLINE") {
      return <div className='text-lg font-semibold text-green-600'>{status}</div>;
    } else if (status === "UNKNOWN") {
      return <div className='text-lg font-semibold text-gray-500'>{status}</div>;
    } else {
      return <div className='text-lg font-semibold text-red-600'>{status}</div>;
    }
  };


  const isDiskDataAvailable = () => {
    if (!data.diskUsages || data.diskUsages.length === 0) return false;

    const firstDiskUsage = data.diskUsages[0];
    return firstDiskUsage.capacity !== 0
      && firstDiskUsage.past20MinUsage.length > 0
      && firstDiskUsage.past20MinUsage[firstDiskUsage.past20MinUsage.length - 1] !== -1;
  };

  const isMemoryDataAvailable = () => {
    if (!data.memoryPressure || data.memoryPressure.length === 0) return false;

    const firstMemoryPressure = data.memoryPressure[0].memory;
    return firstMemoryPressure.total !== 0
      && firstMemoryPressure.used.length > 0
      && firstMemoryPressure.used[firstMemoryPressure.used.length - 1] !== -1;
  };

  const diskDataAvailable = isDiskDataAvailable();
  const memoryDataAvailable = isMemoryDataAvailable();



  let diskStatusForGraphColor: "UP" | "WARNING" | "DOWN" = "UP";

  if (diskDataAvailable) {
    const diskUsage = data.diskUsages[0];
    const capacity = diskUsage.capacity;
    const past20MinUsage = diskUsage.past20MinUsage;
    if ((past20MinUsage[past20MinUsage.length - 1] / capacity) > 0.9) {
      // if disk usage is more than 90%, we consider it as warning.
      diskStatusForGraphColor = "WARNING";
    }
    if ((past20MinUsage[past20MinUsage.length - 1] / capacity) > 0.98) {
      // if disk usage is more than 98%, we consider it as down.
      diskStatusForGraphColor = "DOWN";
    }
  }

  let memoryStatusForGraphColor: "UP" | "WARNING" | "DOWN" = "UP";

  if (memoryDataAvailable) {
    const memoryPressure = data.memoryPressure[0];
    const total = memoryPressure.memory.total;
    const used = memoryPressure.memory.used;
    if ((used[used.length - 1] / total) > 0.95) {
      memoryStatusForGraphColor = "WARNING";
    }
    if ((used[used.length - 1] / total) > 0.98) {
      memoryStatusForGraphColor = "DOWN";
    }
  }



  return (
    <div className={`mx-4 my-4 px-6 py-6 border-4 border-${getCardColor(data)} rounded-xl flex-col items-center justify-center bg-gray-300`}
      style={{ transform: "rotateX(180deg)" }}
    >
      <div className='flex justify-between items-center'>
        <div className='text-xl font-bold text-gray-700'>{data.hostname}</div>
        <div className='text-sm font-semibold text-gray-500'>{data.serverVersion}</div>
      </div>
      <div className='flex-col mt-4'>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600 whitespace-nowrap mr-2'>Services status</div>
          {servicesDetails()}
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Database status</div>
          <div className='text-lg font-semibold'>
            {databaseStatus()}
          </div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Disk usage status</div>
          {
            diskDataAvailable ?
              <div className='w-32 h-6'>
                <SmallDiskChart
                  diskData={data.diskUsages[0]}
                  diskStatusForGraphColor={diskStatusForGraphColor}
                />
              </div>
              :
              <div className='text-lg font-semibold text-red-600'>Data fetch failed</div>
          }
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Memory usage status</div>
          {
            memoryDataAvailable ?
              <div className='w-32 h-6'>
                <SmallMemoryChart
                  memoryData={data.memoryPressure[0]}
                  memoryStatusForGraphColor={memoryStatusForGraphColor}
                />
              </div>
              :
              <div className='text-lg font-semibold text-red-600'>Data fetch failed</div>
          }
        </div>
      </div>
    </div>
  );
}

function getCardColor(data: ServerData) {
  const servicesStatus = getServicesStatus(data.services, data.hostname, data.alias).status;
  const databaseStatus = getDatabaseStatus(data.showDatabaseInfo, data.databaseStatus).status;
  const diskUsageStatus = getDiskUsageStatus(data.diskUsages, data.hostname).status;
  const memoryPressureStatus = getMemoryPressureStatus(data.memoryPressure, data.hostname).status;

  const indicatorStatuses = [servicesStatus, databaseStatus, diskUsageStatus, memoryPressureStatus];

  if (indicatorStatuses.includes("DOWN")) {
    return "red-500";
  } else {
    return "green-500";
  }
}