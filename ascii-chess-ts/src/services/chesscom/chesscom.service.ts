import defaultChessComPuzzle from '../../data/chessComPuzzle.json';
import React, { useState, useEffect } from 'react';

export const getChessComDailyPuzzle = async () => {
    try {
        const response = await fetch('https://api.chess.com/pub/puzzle');

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Chess.com API request failed');
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        return defaultChessComPuzzle;
    }
};
