import axios from "axios";

let apiBaseUrl: string;
if (window.location.hostname === "localhost") {
    apiBaseUrl = "http://localhost:8000";
} else {
    apiBaseUrl = ``;
}

// should the apiBaseURL fetch functions be in a connector/connector.service.ts?
export const fetchLinks = async (inputString: string) => {
    try {
        const url = `${apiBaseUrl}/links/?fen_string=${encodeURIComponent(inputString)}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching links:", error);
    }
};

// Add new function for adjacencies
export const fetchAdjacencies = async (inputString: string) => {
    try {
        const url = `${apiBaseUrl}/adjacencies/?fen_string=${encodeURIComponent(inputString)}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching adjacencies:", error);
    }
};

