import axios from "axios";

let apiBaseUrl: string;
if (window.location.hostname === "localhost") {
  apiBaseUrl = "http://localhost:8000";
} else {
  apiBaseUrl = "https://connector.chess.jbm.eco";
}

/**
 * Unified endpoint that fetches position data for multiple layer types in a single API call.
 * 
 * @param inputString - FEN string representing the board state
 * @param layers - Comma-separated layer names, 'all', or 'none' (default: 'all')
 *                 Options: 'adjacencies', 'links', 'king_box', 'shadows', 'none', or 'all'
 * @param heatmap - Include heatmap data (attack counts per square)
 * @returns Object with nodes array and edges array (edges distinguished by 'type' field)
 * 
 * Edge types include:
 * - 'adjacency': Physical adjacency between pieces
 * - 'threat', 'protection': Attack/defense relationships
 * - 'king_can_move', 'king_blocked_ally', 'king_blocked_threat': King movement
 * - 'caster_threat', 'caster_protection', 'shadow_threat', 'shadow_protection': Pin/X-ray
 */
export const fetchConnections = async (
  inputString: string,
  layers: string = "all",
  heatmap: boolean = false
) => {
  try {
    const url = `${apiBaseUrl}/connections/?fen_string=${encodeURIComponent(inputString)}&layers=${layers}&heatmap=${heatmap}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw error;
  }
};

export const fetchGraphdag = async (edges: any[]) => {
  try {
    const url = `${apiBaseUrl}/graphdag`;
    const response = await axios.put(url, { edges });
    return response.data;
  } catch (error) {
    console.error("Error fetching graphdag:", error);
  }
};
