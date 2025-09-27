import React, { useEffect, useState } from "react";
import "./BoardDisplay.css";
import { BootstrapTheme } from "../controls/ThemeSelector";
import { fetchGraphdag } from "../../services/connector";
import { ProcessedEdge } from "../../types/visualization";

interface GraphDagViewProps {
  edges: ProcessedEdge[];
  theme: BootstrapTheme;
}

const GraphDagView: React.FC<GraphDagViewProps> = ({ edges, theme }) => {
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!edges || edges.length === 0) {
        setAsciiArt("No edges to display");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchGraphdag(edges);
        if (response && response.ascii_art) {
          setAsciiArt(response.ascii_art);
        } else if (response && response.error) {
          setError(response.error);
          setAsciiArt("");
        } else {
          setAsciiArt("No ASCII graph returned from the /graphdag endpoint.");
        }
      } catch (err) {
        setError("Failed to fetch GraphDAG visualization");
        setAsciiArt("");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [edges]);

  if (loading) {
    return (
      <div className="visualization-container board-display">
        <div
          className="ascii-board p-4 rounded-lg font-mono text-xl whitespace-pre overflow-x-auto w-full"
        >
          Loading GraphDAG visualization...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualization-container board-display">
        <div
          className="ascii-board p-4 rounded-lg font-mono text-xl whitespace-pre overflow-x-auto w-full"
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="visualization-container board-display">
      <div
        className="ascii-board p-4 rounded-lg font-mono text-xl whitespace-pre overflow-x-auto w-full"
      >
        {asciiArt}
      </div>
    </div>
  );
};

export default GraphDagView;
