import axios from "axios";

let apiBaseUrl: string;
if (window.location.hostname === "localhost") {
  apiBaseUrl = "http://localhost:8000";
} else {
  apiBaseUrl = "https://connector.chess.jbm.eco";
}

export const fetchLinks = async (inputString: string, heatmap: boolean = false) => {
  try {
    const url = `${apiBaseUrl}/links/?fen_string=${encodeURIComponent(inputString)}&heatmap=${heatmap}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching links:", error);
  }
};

export const fetchAdjacencies = async (inputString: string, heatmap: boolean = false) => {
  try {
    const url = `${apiBaseUrl}/adjacencies/?fen_string=${encodeURIComponent(inputString)}&heatmap=${heatmap}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching adjacencies:", error);
  }
};

export const fetchKingBox = async (inputString: string, heatmap: boolean = false) => {
  try {
    const url = `${apiBaseUrl}/king_box/?fen_string=${encodeURIComponent(inputString)}&heatmap=${heatmap}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching king_box:", error);
  }
};

export const fetchShadows = async (inputString: string, heatmap: boolean = false) => {
  try {
    const url = `${apiBaseUrl}/shadows/?fen_string=${encodeURIComponent(inputString)}&heatmap=${heatmap}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching shadows:", error);
  }
};

export const fetchNone = async (inputString: string, heatmap: boolean = false) => {
  try {
    const url = `${apiBaseUrl}/none/?fen_string=${encodeURIComponent(inputString)}&heatmap=${heatmap}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching none:", error);
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
