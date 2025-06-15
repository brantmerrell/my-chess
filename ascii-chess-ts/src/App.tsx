import "./App.css";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { useState } from "react";
import { PieceDisplayMode } from "./types/chess";
import UnifiedChessContainer from "./components/UnifiedChessContainer";

function App() {
    const [displayMode, setDisplayMode] = useState<PieceDisplayMode>("symbols");

    return (
        <Provider store={store}>
            <div className="App">
                <div className="header-container">
                    <h1 className="title">Ascii Chessboard</h1>
                </div>
                <UnifiedChessContainer
                    displayMode={displayMode}
                    setDisplayMode={setDisplayMode}
                />
            </div>
        </Provider>
    );
}

export default App;
