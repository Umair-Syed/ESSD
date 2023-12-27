import { IDiskUsageForNode } from '@/models/server-data'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    registerables,
    ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

const preprocessData = (dataArray: number[]) => dataArray.map(value => {
    console.log(`Disk datapoint: ${value}`);
    if (value === -1) return null; // Helps to create a break in the line
    return Number(value); 
  });


export default function DiskChart(diskData: IDiskUsageForNode) {


    const diskUsage = preprocessData(diskData.past20MinUsage);
    const capacity = Number(diskData.capacity);

    // Format timestamps into a human-readable format (e.g., HH:mm)
    const formattedLabels = diskData.timestamps.map(timestamp => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    const options: ChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                  boxWidth: 5,
                  boxHeight: 1,
                }
            },
            title: {
                display: true,
                text: 'Disk Usage Over Time (GB) - Capacity: ' + capacity + ' GB',
            },
        },
        scales: {
            y: {
                type: 'linear',
                suggestedMax: capacity,
                beginAtZero: true,
                ticks: {
                    callback: function (value: number | string, index: number) {
                        if (typeof value === 'number') {
                            return value + ' GB';
                        }
                        return value + ' GB';
                    }
                }
            }
        }
    };

    const data = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Disk usage',
                data: diskUsage,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return <Line options={options as any} data={data} />;
}
