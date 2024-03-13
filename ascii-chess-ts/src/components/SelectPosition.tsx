import React, { useState } from "react";
import { getLiChessDailyPuzzle } from "../services/lichess/lichess.service";
import { getChessComDailyPuzzle } from "../services/chesscom/chesscom.service";
import './SelectPosition.css';

const SelectPosition: React.FC = () => {
  // State to store the selected option
  const [selectedOption, setSelectedOption] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const makeApiCall = (option: string) => {
      console.log(option);
      const response = getChessComDailyPuzzle();
      console.log(response);
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Set the selected option to the state
    setSelectedOption(event.target.value);
    makeApiCall(event.target.value);

     //console log the selected option
    console.log("Selected Option:", event.target.value);
  };

  return (
    <div>
      <select className="start-fen" value={selectedOption} onChange={handleOptionChange}>
        <option value="standard">Standard Starting Position</option>
        <option value="lichess-daily-puzzle">Daily Lichess Puzzle</option>
        <option value="c.com-daily-puzzle">Daily Chess.com Puzzle</option>
      </select>
    </div>
  );
};

export default SelectPosition;
