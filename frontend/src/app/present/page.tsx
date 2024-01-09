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


const CARD_WIDTH = 450;
const CARD_HEIGHT = 240;

export default function PresentPage() {
  const { selectedFilter } = useSelectedFilter();
  const { serversData, setServersData } = useServersData();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filteredServers, setFilteredServers] = useState(serversData);
  const [flipped, setFlipped] = useState(false);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT);

  const updateCardDimensions = () => {
    const navbar = document.querySelector('.navbar') as HTMLElement;
    const isNavbarHidden = navbar && navbar.classList.contains('navbar-hidden');
    const availableWidth = window.innerWidth;
    const availableHeight = (isNavbarHidden ? window.innerHeight : window.innerHeight - navbar!.offsetHeight) - 64; // 32px padding top and bottom

    const cols = 3;
    const rows = 2;
    const marginY = 32;
    const marginX = 16;

    // Calculate new card dimensions
    const newCardWidth = availableWidth / cols - (marginY * (cols + 1));
    const newCardHeight = availableHeight / rows - (marginX * (rows + 1));

    setCardWidth(newCardWidth);
    setCardHeight(newCardHeight);
  };

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

  useEffect(() => {
    updateCardDimensions();
    window.addEventListener('resize', updateCardDimensions);
    return () => window.removeEventListener('resize', updateCardDimensions);
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
    <Carousel cols={3} rows={2} gap={5} loop autoplay={3000} showDots={true} hideArrow={true}>
      {filteredServers.map((server, index) => (
        <Carousel.Item key={index}>
          {/* <CardFront data={server} /> */}
          <animated.div style={flipAnimation}>
            {flipped ? <CardBack data={server} cardWidth={cardWidth} cardHeight={cardHeight} /> : <CardFront data={server} cardWidth={cardWidth} cardHeight={cardHeight} />}
          </animated.div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}


interface CardProps {
  data: ServerData;
  cardWidth: number;
  cardHeight: number;
}


function CardFront({ data, cardWidth, cardHeight }: CardProps) {
  const scaleX = cardWidth / CARD_WIDTH;
  const scaleY = cardHeight / CARD_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className='mx-2 my-4 px-6 py-6 border-4 border-green-500 rounded-xl flex-col items-center justify-center bg-green-500/20'
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center', 
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      }}
      >
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

function CardBack({ data, cardWidth, cardHeight }: CardProps) {
  const scaleX = cardWidth / CARD_WIDTH;
  const scaleY = cardHeight / CARD_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className='mx-2 my-4 px-6 py-6 border-4 border-green-500 rounded-xl flex-col items-center justify-center bg-gray-300'
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      }} 
      >
      <div style={{transform: "rotateX(180deg)"}}>
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
    </div>
  );
}