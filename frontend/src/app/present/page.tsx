'use client';
import { useEffect, useState, useRef } from 'react';
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
import { Spinner } from 'flowbite-react';

export default function PresentPage() {
  const { selectedFilter } = useSelectedFilter();
  const { serversData, setServersData } = useServersData();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filteredServers, setFilteredServers] = useState(serversData);
  const [flipped, setFlipped] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPageShown, setIsPageShown] = useState(false);

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

    // Automatically refresh data every 5min
    const interval = setInterval(() => {
      fetchData();
    }, 300000); // 5min

    return () => clearInterval(interval);
  }, [selectedFilter]);


  useEffect(() => {
    if (!Array.isArray(serversData)) return;
    setFilteredServers(serversData);
  }, [serversData]);


  // 7 seconds wait for back side, and 3 seconds wait for front side 
  useEffect(() => {
    let flipTimeout: NodeJS.Timeout;
    let nextFlipInMs = 7000;
    const flip = () => {
      
      setFlipped((prev) => {

        nextFlipInMs = prev ? 7000 : 3000;
        return !prev;
      });
      flipTimeout = setTimeout(flip, nextFlipInMs);
    };
    flipTimeout = setTimeout(flip, 3000);

    return () => clearTimeout(flipTimeout);
  }, []);


  // to move to next page
  useEffect(() => {
    if (!flipped && isPageShown) { // flipped == back side
      const nextButton = carouselRef.current?.querySelector('span[type="next"]') as HTMLElement;
      nextButton?.click();

      setIsPageShown(false);
    } else if (!isPageShown) {
      setIsPageShown(true);
    } 
  }, [flipped]);


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
  

  return (
    <div className='mt-8' ref={carouselRef}>
      {filteredServers.length > 0 ? (
        <Carousel cols={3} rows={2} gap={5} loop showDots={true} hideArrow={false}>
          {filteredServers.map((server, index) => (
            <Carousel.Item key={index}>
              <animated.div style={flipAnimation}>
                {flipped ? <CardBack data={server} /> : <CardFront data={server} />}
              </animated.div>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <div className="text-center text-gray-500 font-bold text-xl">{isLoadingData ? <Spinner aria-label="Large spinner example" size="xl" color="success" /> : "No servers found"}</div>
      )}
    </div>
  );
}


interface CardProps {
  data: ServerData;
}

function CardFront({ data }: CardProps) {
  const cardColor = getCardColor(data, false);
  const translucentCardColor = getCardColor(data, true);

  const match = cardColor.match(/\d+/g); // extract the RGB values from the card color
  const rgbValues = match ? match.slice(0, 3).join(", ") : "0, 0, 0"; // Fallback to black if no match

  const shadowColor = `rgba(${rgbValues}, 0.5)`; 

  return (
    <div className={`mx-4 my-4 px-6 py-6 border-4 rounded-xl flex-col items-center justify-center`}
      style={{
        backgroundColor: translucentCardColor,
        borderColor: cardColor,
        boxShadow: `0px 4px 8px ${shadowColor}`
      }}
    >
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

      let downProcessesMarqueeString = [];
      if (data.supervisorctlStatus.length > 0 && data.supervisorctlStatus[0].processesStatus.length > 0) {
        // If supervisorctlStatus is available, we use it to get the down processes.
        for (let process of data.supervisorctlStatus[0].processesStatus) {
          if (process.status !== "RUNNING") {
            downProcessesMarqueeString.push(process.name);
          }
        }

        return (
          <div className='max-w-xs text-base font-semibold text-red-600 overflow-hidden'>
            <div style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              animation: 'marquee 10s linear infinite'
            }}>
              {'Processes down: ' + downProcessesMarqueeString}
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


  const cardColor = getCardColor(data, false);

  const match = cardColor.match(/\d+/g); // extract the RGB values from the card color
  const rgbValues = match ? match.slice(0, 3).join(", ") : "0, 0, 0"; // Fallback to black if no match

  const shadowColor = `rgba(${rgbValues}, 0.5)`; 


  return (
    <div className={`mx-4 my-4 px-6 py-6 border-4 rounded-xl flex-col items-center justify-center bg-gray-300`}
      style={{
        transform: "rotateX(180deg)", 
        borderColor: cardColor,
        boxShadow: `0px 4px 8px ${shadowColor}` 
      }}
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

  function getCardColor(data: ServerData, translucent = false) {
    const servicesStatus = getServicesStatus(data.services, data.hostname, data.alias).status;
    const databaseStatus = getDatabaseStatus(data.showDatabaseInfo, data.databaseStatus).status;
    const diskUsageStatus = getDiskUsageStatus(data.diskUsages, data.hostname).status;
    const memoryPressureStatus = getMemoryPressureStatus(data.memoryPressure, data.hostname).status;

    const indicatorStatuses = [servicesStatus, databaseStatus, diskUsageStatus, memoryPressureStatus];

    if (indicatorStatuses.includes("DOWN")) {
      return translucent ? "rgb(220, 38, 38, 0.2)" : "rgb(220, 38, 38)"; //red-500
    } else {
      return translucent ? "rgb(22, 163, 74, 0.2)" : "rgb(22, 163, 74)"; // green-500
    }
  }