import React from "react";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

interface FENCharacterCountProps {
    fenHistory: string[];
}

const FENCharacterCount: React.FC<FENCharacterCountProps> = ({
    fenHistory,
}) => {
    const labels = fenHistory.map((_, index) => `Move ${index}`);
    const data = {
        labels: labels,
        datasets: [
            {
                label: "FEN String Length Over Time",
                data: fenHistory.map((fen) => fen.length),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                    color: "white",
                }
            },
            y: {
                grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                },
                ticks: {
                    color: "white",
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: "white",
                }
            }
        }
    };

    return (
        <div className="w-full" style={{ width: "600px", height: "400px" }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default FENCharacterCount;

