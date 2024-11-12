import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import App from "../App";
import { chessGameSlice } from "../reducers/positions/positions.reducers";
import { liChessPuzzleSlice, chessComPuzzleSlice } from "../reducers/puzzles/puzzles.reducers";
import { selectedSetupReducer } from "../reducers/setups/setups.reducers";
import * as lichessService from "../services/lichess/lichess.service";
import * as chesscomService from "../services/chesscom/chesscom.service";
import { SetupOptions } from "../models/SetupOptions";
import liChessPuzzleData from "../data/liChessPuzzle.json";
import chessComPuzzleData from "../data/chessComPuzzle.json";

jest.mock("../services/lichess/lichess.service");
jest.mock("../services/chesscom/chesscom.service");

describe("Setup Selection Integration Tests", () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                chessGame: chessGameSlice.reducer,
                liChessPuzzle: liChessPuzzleSlice.reducer,
                chessComPuzzle: chessComPuzzleSlice.reducer,
                selectedSetup: selectedSetupReducer,
            },
        });

        (lichessService.getLiChessDailyPuzzle as jest.Mock).mockResolvedValue(liChessPuzzleData);
        (chesscomService.getChessComDailyPuzzle as jest.Mock).mockResolvedValue(chessComPuzzleData);
    });

    test("Chess.com puzzle setup loads FEN and clears setup history", async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        const selectElement = screen.getByRole("combobox", { name: /position selection/i });
        await act(async () => {
            fireEvent.change(selectElement, {
                target: { value: SetupOptions.CHESS_COM_DAILY_PUZZLE },
            });
        });

        await waitFor(() => {
            const fenInput = screen.getByLabelText("FEN Input") as HTMLInputElement;
            expect(fenInput.value).toBe(
                "r4rk1/pp1b1pp1/4p2p/1Pp5/q1P4n/PN3Q2/1B2P1PP/R3KB1n w Q - 0 1"
            );
        });

        const submitButton = screen.getByText("Submit FEN");
        await act(async () => {
            fireEvent.click(submitButton);
        });

        const state = store.getState();
        expect(state.chessGame.positions.length).toBe(1);
        expect(state.chessGame.history.length).toBe(0);
    });

    test("changing setups clears previous setup state", async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        const selectElement = screen.getByRole("combobox", { name: /position selection/i });

        await act(async () => {
            fireEvent.change(selectElement, {
                target: { value: SetupOptions.LICHESS_DAILY_PUZZLE },
            });
        });

        await waitFor(() => {
            const state = store.getState();
            expect(state.liChessPuzzle.setupHistory).toBeDefined();
        });

        await act(async () => {
            fireEvent.change(selectElement, {
                target: { value: SetupOptions.CHESS_COM_DAILY_PUZZLE },
            });
        });

        const submitButton = screen.getByText("Submit FEN");
        await act(async () => {
            fireEvent.click(submitButton);
        });

        const state = store.getState();
        expect(state.chessGame.positions.length).toBe(1);
        expect(state.chessGame.history.length).toBe(0);
    });

    test("helper visuals update after FEN submission", async () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        const helperSelect = screen.getByRole("combobox", { name: /helper visual selection/i });
        await act(async () => {
            fireEvent.change(helperSelect, { target: { value: "History Table" } });
        });

        const setupSelect = screen.getByRole("combobox", { name: /position selection/i });
        await act(async () => {
            fireEvent.change(setupSelect, {
                target: { value: SetupOptions.LICHESS_DAILY_PUZZLE },
            });
        });

        await waitFor(() => {
            const submitButton = screen.getByText("Submit FEN");
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            const historyTable = screen.getByRole("table");
            expect(historyTable).toBeInTheDocument();
            const tableRows = screen.getAllByRole("row");
            expect(tableRows.length).toBeGreaterThan(1);
        });
    });
});


