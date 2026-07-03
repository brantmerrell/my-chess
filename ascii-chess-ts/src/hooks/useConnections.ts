import { useEffect, useState } from "react";
import { fetchConnections } from "../services/connector";
import {
  ConnectionType,
  LinksResponse,
  ProcessedEdge,
} from "../types/visualization";

export function useConnections(
  fen: string,
  connectionType: ConnectionType,
  heatmap: boolean,
) {
  const [linksData, setLinksData] = useState<LinksResponse | null>(null);
  const [processedEdges, setProcessedEdges] = useState<ProcessedEdge[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await fetchConnections(fen, connectionType, heatmap);
        if (fetchedData && fetchedData.nodes && fetchedData.edges) {
          setLinksData(fetchedData);
          setProcessedEdges(
            fetchedData.edges.map((edge: any) => ({
              source:
                typeof edge.source === "string"
                  ? edge.source
                  : edge.source.square,
              target:
                typeof edge.target === "string"
                  ? edge.target
                  : edge.target.square,
              type: edge.type,
            })),
          );
        } else {
          setLinksData({ nodes: [], edges: [] });
          setProcessedEdges([]);
        }
      } catch (error) {
        setLinksData({ nodes: [], edges: [] });
        setProcessedEdges([]);
      }
    };
    fetchData();
  }, [fen, connectionType, heatmap]);

  return { linksData, processedEdges };
}
