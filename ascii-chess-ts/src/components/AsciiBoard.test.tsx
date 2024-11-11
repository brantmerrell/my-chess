import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../app/store";
import AsciiBoard from "../components/AsciiBoard";
import { PieceDisplayMode } from "../types/chess";

describe("AsciiBoard Component", () => {
    const defaultProps = {
        displayMode: "letters" as PieceDisplayMode,
        setDisplayMode: jest.fn(),
    };

    test("renders AsciiBoard component", () => {
        render(
            <Provider store={store}>
                <AsciiBoard {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText("Submit FEN")).toBeInTheDocument();
        expect(screen.getByText("Submit Move")).toBeInTheDocument();
        expect(screen.getByText("Undo Move")).toBeInTheDocument();
    });

    test("changes FEN on input change", () => {
        render(
            <Provider store={store}>
                <AsciiBoard {...defaultProps} />
            </Provider>
        );

        const fenInput = screen.getByLabelText("FEN Input") as HTMLInputElement;
        fireEvent.change(fenInput, {
            target: {
                value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            },
        });

        expect(fenInput.value).toBe(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        );
    });

    test("submits FEN on button click", () => {
        render(
            <Provider store={store}>
                <AsciiBoard {...defaultProps} />
            </Provider>
        );

        const fenInput = screen.getByLabelText("FEN Input") as HTMLInputElement;
        const submitFenButton = screen.getByText("Submit FEN");

        fireEvent.change(fenInput, {
            target: {
                value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            },
        });
        fireEvent.click(submitFenButton);

        const currentFen = store.getState().chessGame.fen;
        expect(currentFen).toBe(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        );
    });

    test("submits move on button click", () => {
        render(
            <Provider store={store}>
                <AsciiBoard {...defaultProps} />
            </Provider>
        );

        const moveInput = screen.getByLabelText(
            "Move Input"
        ) as HTMLInputElement;
        const submitMoveButton = screen.getByText("Submit Move");

        fireEvent.change(moveInput, { target: { value: "e4" } });
        fireEvent.click(submitMoveButton);

        const currentMoves = store.getState().chessGame.moves;
        expect(currentMoves).toBeTruthy();
    });

    test("undoes move on button click", () => {
        render(
            <Provider store={store}>
                <AsciiBoard {...defaultProps} />
            </Provider>
        );

        const undoButton = screen.getByText("Undo Move");
        fireEvent.click(undoButton);

        const currentMoves = store.getState().chessGame.moves;
        expect(currentMoves.length).toBeGreaterThan(2);
    });

    test("changes display mode when buttons are clicked", () => {
        const mockSetDisplayMode = jest.fn();
        render(
            <Provider store={store}>
                <AsciiBoard
                    displayMode="letters"
                    setDisplayMode={mockSetDisplayMode}
                />
            </Provider>
        );

        const symbolsButton = screen.getByText("Show Symbols");
        fireEvent.click(symbolsButton);
        expect(mockSetDisplayMode).toHaveBeenCalledWith("symbols");

        const maskedButton = screen.getByText("Mask Board");
        fireEvent.click(maskedButton);
        expect(mockSetDisplayMode).toHaveBeenCalledWith("masked");

        const lettersButton = screen.getByText("Show Letters");
        fireEvent.click(lettersButton);
        expect(mockSetDisplayMode).toHaveBeenCalledWith("letters");
    });

    // Reset mock function after each test
    afterEach(() => {
        jest.clearAllMocks();
    });
});
