import { IMemoryPressureForNode } from '@/models/server-data'
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
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ...registerables,
    annotationPlugin,
);

const preprocessData = (dataArray: number[]) => {
    if (!dataArray || dataArray.length === 0) return [];
    return dataArray.map(value => {
        if (value === -1) return null; // Helps to create a break in the line
        return Number((value / 1024).toFixed(1)); // Convert MB to GB
    })
};


export default function MemoryChart(memoryData: IMemoryPressureForNode) {


    const memoryUsedGB = preprocessData(memoryData.memory.used);
    const swapUsedGB = preprocessData(memoryData.swap.used);

    const totalMemoryGB = Number((memoryData.memory.total / 1024).toFixed(1));
    const totalSwapMemoryGB = Number((memoryData.swap.total / 1024).toFixed(1));

    // Format timestamps into a human-readable format (e.g., HH:mm)
    const formattedLabels = (memoryData.timestamps && memoryData.timestamps.length > 0) ? memoryData.timestamps.map(timestamp => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }) : [];

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
                text: 'Memory and Swap Usage Over Time (GB)',
            },
            annotation: {
                annotations: {
                    line1: {
                        type: 'line' as const,
                        yMin: totalSwapMemoryGB,
                        yMax: totalSwapMemoryGB,
                        borderColor: 'rgb(255, 179, 195)',
                        borderWidth: 2,
                        borderDash: [10, 5],
                    }
                }
            },
        },
        scales: {
            y: {
                type: 'linear',
                max: totalMemoryGB,
                beginAtZero: true,
                ticks: {
                    callback: function (value: number | string, index: number) {
                        if (typeof value === 'number') {
                            return value.toFixed(1) + ' GB';
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
                label: 'Swap Used',
                data: swapUsedGB,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Memory Used',
                data: memoryUsedGB,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return <Line options={options as any} data={data} />;
}
