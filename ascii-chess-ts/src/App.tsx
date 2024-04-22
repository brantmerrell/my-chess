import "./App.css";
import { store } from "./app/store";
import { Provider } from "react-redux";
import AsciiBoard from "./components/AsciiBoard";
import LinksDisplay from "./components/LinksDisplay";

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <div>
                    <h1 className="title">Ascii Chessboard</h1>
                </div>
<div className="chess-container">
    <AsciiBoard />
    <LinksDisplay />
</div>
                <div></div>
            </div>
        </Provider>
    );
}

export default App;
