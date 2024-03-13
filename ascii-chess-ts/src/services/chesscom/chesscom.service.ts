import React, { useState, useEffect } from 'react';

export const getChessComDailyPuzzle = async () => {
  try {
    const response = await fetch('https://api.chess.com/pub/puzzle'); 

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      return data;
    }
  } catch (error) {
      console.error(error);
  }
};

