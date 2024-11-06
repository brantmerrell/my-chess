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

    return <Line data={data} />;
};

export default FENCharacterCount;
