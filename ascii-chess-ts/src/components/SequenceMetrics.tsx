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
import annotationPlugin from "chartjs-plugin-annotation";
import { ChessGame } from "../chess/chessGame";
import { Line } from "react-chartjs-2";
import { Position } from "../types/chess";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  annotationPlugin,
);

interface SequenceMetricsProps {
  fenHistory: string[];
  positions?: Position[];
  currentPositionIndex?: number;
}

// TODO
// Add centipawn advantage (API/service dependent)
const SequenceMetrics: React.FC<SequenceMetricsProps> = ({
  fenHistory,
  positions,
  currentPositionIndex = 0,
}) => {
  const labels = positions
    ? positions.map((pos) => pos.san || `${pos.ply}`)
    : fenHistory.map((_, index) => `${index}`);
  const pieceData = fenHistory.map(ChessGame.countPiecesFromFen);
  const mobilityData = fenHistory.map(ChessGame.calculateMobilityFromFen);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "FEN String Length Over Time",
        data: fenHistory.map((fen) => fen.length),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
        yAxisID: "y1",
        hidden: true,
      },
      {
        label: "White Piece Count",
        data: pieceData.map((data) => data.white),
        borderColor: "rgba(255, 255, 255, 1)",
        fill: false,
        yAxisID: "y1",
      },
      {
        label: "Black Piece Count",
        data: pieceData.map((data) => data.black),
        borderColor: "rgba(0, 0, 0, 1)",
        fill: false,
        yAxisID: "y1",
      },
      {
        label: "White Mobility",
        data: mobilityData.map((data) => data.white),
        borderColor: "rgba(255, 206, 86, 1)",
        fill: false,
        yAxisID: "y1",
      },
      {
        label: "Black Mobility",
        data: mobilityData.map((data) => data.black),
        borderColor: "rgba(255, 165, 0, 1)",
        fill: false,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
        },
      },
      y0: {
        // why is this a decimal when y1 is a count?
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          color: "slateGray",
        },
        ticks: {
          color: "slateGray",
          drawOnChartArea: false,
        },
        title: {
          display: true,
          color: "slateGray",
        },
      },
      y1: {
        // why is this a count when y0 is a decimal?
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          drawOnChartArea: true,
        },
        ticks: {
          color: "white",
        },
        title: {
          display: true,
          text: "Count",
          color: "white",
        },
      },
    },
    plugins: {
      annotation: {
        annotations: {
          currentPosition: {
            type: "line" as const,
            xMin: currentPositionIndex,
            xMax: currentPositionIndex,
            borderColor: "rgba(255, 99, 132, 0.8)",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              enabled: true,
              content: `Ply ${currentPositionIndex}`,
              position: "start" as const,
              backgroundColor: "rgba(255, 99, 132, 0.8)",
              color: "white",
              font: {
                size: 11,
              },
            },
          },
        },
      },
      legend: {
        labels: {
          color: "white",
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return `Ply ${context[0].dataIndex}`;
          },
          afterBody: (context: any) => {
            const moveIndex = context[0].dataIndex;
            const pieces = pieceData[moveIndex];
            const mobility = mobilityData[moveIndex];
            const pieceDifference = pieces.white - pieces.black;
            const mobilityDifference = mobility.white - mobility.black;
            return [
              `Total pieces: ${pieces.white + pieces.black}`,
              `Piece difference: ${pieceDifference > 0 ? "+" : ""}${pieceDifference}`,
              `Total mobility: ${mobility.totalMoves}`,
              `Mobility difference: ${mobilityDifference > 0 ? "+" : ""}${mobilityDifference}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div
      className="visualization-container visualization-container--fixed-height sequence-metrics-container"
      style={{
        padding: "1rem",
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default SequenceMetrics;
