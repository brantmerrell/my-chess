import "./App.css";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { useState } from "react";
import { PieceDisplayMode } from "./types/chess";
import AsciiBoard from "./components/AsciiBoard";
import HelperVisual from "./components/HelperVisual";

function App() {
    const [displayMode, setDisplayMode] = useState<PieceDisplayMode>("letters");

    return (
        <Provider store={store}>
            <div className="App">
                <div>
                    <h1 className="title">Ascii Chessboard</h1>
                </div>
                <div className="chess-container">
                    <AsciiBoard 
                        displayMode={displayMode} 
                        setDisplayMode={setDisplayMode} 
                    />
                    <HelperVisual 
                        displayMode={displayMode} 
                    />
                </div>
                <div></div>
            </div>
        </Provider>
    );
}

export default App;


