import axios from 'axios';

let apiBaseUrl: string;
if (window.location.hostname === 'localhost') {
    apiBaseUrl = 'http://localhost:8000';
} else {
    apiBaseUrl = 'http://connector:5001';
}


export const fetchLinks = async (inputString: string) => {
  try {
    const url = `${apiBaseUrl}/links/?fen_string=${encodeURIComponent(inputString)}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching links:', error);
  }
};
