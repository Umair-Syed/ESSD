'use client';
import { useEffect, useState } from 'react';
import { getServersDataForFilter, getAllServersData } from '@/network/api/serversDataApis';
import { ServerData } from '@/models/server-data';
import { useSelectedFilter } from '@/contexts/SelectedFilterContext';
import { useServersData } from '@/contexts/ServersDataContext';
import { FaHardDrive, FaMemory, FaDatabase } from "react-icons/fa6";
import { IoCellular } from "react-icons/io5";
import { useSpring, animated } from 'react-spring';
import Carousel from 'react-grid-carousel';


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

  return (
    <div className='mx-4 my-4 px-6 py-6 border-4 border-green-500 rounded-xl flex-col items-center justify-center bg-green-500/20'>
      <div className='flex justify-between items-center'>
        <div className='text-xl font-bold text-gray-700'>{data.hostname}</div>
        <div className='text-sm font-semibold text-gray-500'>{data.serverVersion}</div>
      </div>
      <div className='flex-col mt-4'>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Services status</div>
          <div className='text-xl'><IoCellular /></div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Database status</div>
          <div className='text-xl'><FaDatabase /></div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Disk usage status</div>
          <div className='text-xl'><FaHardDrive /></div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Memory usage status</div>
          <div className='text-xl'><FaMemory /></div>
        </div>
      </div>
    </div>
  );
}

function CardBack({ data }: CardProps) {

  return (
    <div className='mx-4 my-4 px-6 py-6 border-4 border-green-500 rounded-xl flex-col items-center justify-center bg-gray-300'
      style={{ transform: "rotateX(180deg)" }}
    >
      <div className='flex justify-between items-center'>
        <div className='text-xl font-bold text-gray-700'>{data.hostname}</div>
        <div className='text-sm font-semibold text-gray-500'>{data.serverVersion}</div>
      </div>
      <div className='flex-col mt-4'>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Services status</div>
          <div className='text-lg font-semibold text-red-600'>2 Down</div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Database status</div>
          <div className='text-lg font-semibold text-green-600'>ONLINE</div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Disk usage status</div>
          <div className='text-xl'>
            <FaHardDrive />
          </div>
        </div>
        <div className='flex justify-between mb-2'>
          <div className='text-gray-600'>Memory usage status</div>
          <div className='text-xl'>
            <FaMemory />
          </div>
        </div>
      </div>
    </div>
  );
}