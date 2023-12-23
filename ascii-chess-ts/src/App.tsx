import React from 'react';
import logo from './logo.svg';
import './App.css';
import ChessBoard from './components/ChessBoard';

function App() {
  return (
    <div className="App">
      <div>
        <h1 className="title">Ascii Chess</h1>
        </div>
          <ChessBoard />
        <div>
      </div>
    </div>
  );
}

export default App;
