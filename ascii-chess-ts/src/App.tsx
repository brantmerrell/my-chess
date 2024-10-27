import "./App.css";
import { store } from "./app/store";
import { Provider } from "react-redux";
import AsciiBoard from "./components/AsciiBoard";
import HelperVisual from "./components/HelperVisual";

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <div>
                    <h1 className="title">Ascii Chessboard</h1>
                </div>
                <div className="chess-container">
                    <AsciiBoard />
                    <HelperVisual />
                </div>
                <div></div>
            </div>
        </Provider>
    );
}

export default App;
