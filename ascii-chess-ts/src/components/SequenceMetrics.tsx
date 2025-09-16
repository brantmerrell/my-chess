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
  annotationPlugin
);

interface SequenceMetricsProps {
  fenHistory: string[];
  positions?: Position[];
  currentPositionIndex?: number;
}

type MetricType = "fen_length" | "piece_count" | "mobility" | "point_count";

// TODO
// Add centipawn advantage (API/service dependent)
const SequenceMetrics: React.FC<SequenceMetricsProps> = ({
  fenHistory,
  positions,
  currentPositionIndex = 0,
}) => {
  const [selectedMetric, setSelectedMetric] =
    React.useState<MetricType>("piece_count");
  const labels = positions
    ? positions.map((pos) => pos.san || `${pos.ply}`)
    : fenHistory.map((_, index) => `${index}`);
  const pieceData = fenHistory.map(ChessGame.countPiecesFromFen);
  const mobilityData = fenHistory.map(ChessGame.calculateMobilityFromFen);

  const piecePointValues: { [key: string]: number } = {
    k: 0,
    K: 0,
    q: 9,
    Q: 9,
    r: 5,
    R: 5,
    b: 3,
    B: 3,
    n: 3,
    N: 3,
    p: 1,
    P: 1,
  };

  const calculatePointCount = (fen: string) => {
    const position = fen.split(" ")[0];
    let whitePoints = 0;
    let blackPoints = 0;

    for (const char of position) {
      if (piecePointValues[char] !== undefined) {
        if (char === char.toUpperCase()) {
          whitePoints += piecePointValues[char];
        } else {
          blackPoints += piecePointValues[char];
        }
      }
    }

    return { white: whitePoints, black: blackPoints };
  };

  const pointData = fenHistory.map(calculatePointCount);

  const getDatasets = () => {
    switch (selectedMetric) {
      case "fen_length":
        return [
          {
            label: "FEN Length",
            data: fenHistory.map((fen) => fen.length),
            borderColor: "rgba(255, 215, 0, 1)",
            fill: false,
            yAxisID: "y1",
          },
        ];
      case "piece_count":
        return [
          {
            label: "White Pieces",
            data: pieceData.map((data) => data.white),
            borderColor: "LightGray",
            fill: false,
            yAxisID: "y1",
          },
          {
            label: "Black Pieces",
            data: pieceData.map((data) => data.black),
            borderColor: "DarkGray",
            fill: false,
            yAxisID: "y1",
          },
          {
            label: "Difference (White - Black)",
            data: pieceData.map((data) => data.white - data.black),
            borderColor: "DodgerBlue",
            fill: false,
            yAxisID: "y1",
          },
        ];
      case "point_count":
        return [
          {
            label: "White Points",
            data: pointData.map((data) => data.white),
            borderColor: "LightGray",
            fill: false,
            yAxisID: "y1",
          },
          {
            label: "Black Points",
            data: pointData.map((data) => data.black),
            borderColor: "DarkGray",
            fill: false,
            yAxisID: "y1",
          },
          {
            label: "Difference (White - Black)",
            data: pointData.map((data) => data.white - data.black),
            borderColor: "DodgerBlue",
            fill: false,
            yAxisID: "y1",
          },
        ];
      case "mobility":
        return [
          {
            label: "White Mobility",
            data: mobilityData.map((data) => data.white),
            borderColor: "LightGray",
            fill: false,
            yAxisID: "y1",
          },
          {
            label: "Black Mobility",
            data: mobilityData.map((data) => data.black),
            borderColor: "DarkGray",
            fill: false,
            yAxisID: "y1",
          },
          {
            label: "Difference (White - Black)",
            data: mobilityData.map((data) => data.white - data.black),
            borderColor: "DodgerBlue",
            fill: false,
            yAxisID: "y1",
          },
        ];
      default:
        return [];
    }
  };

  const data = {
    labels: labels,
    datasets: getDatasets(),
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
    layout: {
      padding: 0,
    },
    elements: {
      point: {
        backgroundColor: "transparent",
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
          zeroLine: {
            type: "line" as const,
            yMin: 0,
            yMax: 0,
            borderColor: "rgba(255, 255, 255, 0.6)",
            borderWidth: 1,
            borderDash: [3, 3],
          },
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return `Ply ${context[0].dataIndex}`;
          },
          afterBody: (context: any) => {
            const moveIndex = context[0].dataIndex;

            switch (selectedMetric) {
              case "fen_length":
                return [`FEN Length: ${fenHistory[moveIndex].length}`];
              case "piece_count":
                const pieces = pieceData[moveIndex];
                const pieceDifference = pieces.white - pieces.black;
                return [
                  `Total pieces: ${pieces.white + pieces.black}`,
                  `Piece difference: ${pieceDifference > 0 ? "+" : ""}${pieceDifference}`,
                ];
              case "point_count":
                const points = pointData[moveIndex];
                const pointDifference = points.white - points.black;
                return [
                  `Total points: ${points.white + points.black}`,
                  `Point difference: ${pointDifference > 0 ? "+" : ""}${pointDifference}`,
                ];
              case "mobility":
                const mobility = mobilityData[moveIndex];
                const mobilityDifference = mobility.white - mobility.black;
                return [
                  `Total mobility: ${mobility.totalMoves}`,
                  `Mobility difference: ${mobilityDifference > 0 ? "+" : ""}${mobilityDifference}`,
                ];
              default:
                return [];
            }
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
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>
            Metric:
          </span>
          {[
            { value: "piece_count", label: "Piece Count" },
            { value: "point_count", label: "Point Count" },
            { value: "mobility", label: "Mobility" },
            { value: "fen_length", label: "FEN Length" },
          ].map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "white",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="metric"
                value={value}
                checked={selectedMetric === value}
                onChange={(e) =>
                  setSelectedMetric(e.target.value as MetricType)
                }
                style={{ margin: 0 }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  );
};

export default SequenceMetrics;
