import React from 'react';
import logo from './logo.svg';
import './App.css';
import ChessBoard from './components/ChessBoard';

function App() {
  return (
    <div className="App">
      <div>
          <h1>Ascii Chess</h1>
          <ChessBoard />
      </div>
    </div>
  );
}

export default App;
