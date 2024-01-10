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


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ...registerables,
);

const preprocessData = (dataArray: number[]) => {
    if (!dataArray || dataArray.length === 0) return [];
    return dataArray.map(value => {
        if (value === -1) return null; // Helps to create a break in the line
        return Number((value / 1024).toFixed(1)); // Convert MB to GB
    })
};


interface SmallMemoryChartProps {
    memoryData: IMemoryPressureForNode;
    memoryStatusForGraphColor: "UP" | "WARNING" | "DOWN";
}


export default function SmallDiskChart({ memoryData, memoryStatusForGraphColor }: SmallMemoryChartProps) {
    const memoryUsedGB = preprocessData(memoryData.memory.used);

    const totalMemoryGB = Number((memoryData.memory.total / 1024).toFixed(1));

    // Format timestamps into a human-readable format (e.g., HH:mm)
    const formattedLabels = (memoryData.timestamps && memoryData.timestamps.length > 0) ? memoryData.timestamps.map(timestamp => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }) : [];

    const options: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            },
        },
        elements: {
            point: {
                radius: 0
            }
        }
    };


    let lineColor;
    switch (memoryStatusForGraphColor) {
        case "WARNING":
            lineColor = 'rgb(234, 179, 8)'; // Yellow-500 for WARNING
            break;
        case "DOWN":
            lineColor = 'rgb(220, 38, 38)'; // Red-600 for DOWN
            break;
        default:
            lineColor = 'rgb(53, 162, 235)'; // Default color
    }

    const data = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Memory Used',
                data: memoryUsedGB,
                borderColor: lineColor,
            },
        ],
    };

    return <Line options={options as any} data={data} />;
}
