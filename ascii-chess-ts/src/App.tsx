import "./App.css";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PieceDisplayMode } from "./types/chess";
import UnifiedChessContainer from "./components/UnifiedChessContainer";
import AuthCallback from "./components/auth/AuthCallback";
import LichessLogin from "./components/auth/LichessLogin";

function App() {
  const [displayMode, setDisplayMode] = useState<PieceDisplayMode>("symbols");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={
            <div className="App">
              <div className="header-container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px'
              }}>
                <h1 className="title">Ascii Chessboard</h1>
                <LichessLogin onAuthChange={setIsAuthenticated} />
              </div>
              <UnifiedChessContainer
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
              />
            </div>
          } />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
