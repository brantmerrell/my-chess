import React, { useState, useEffect } from 'react';

export interface LichessResponse {
  // Add response data schema here
}

export const getLiChessDailyPuzzle = async () => {
  try {
    const response = await fetch('https://lichess.org/api/puzzle/daily'); 

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      return data;
    }
  } catch (error) {
      console.error(error);
  }
};

