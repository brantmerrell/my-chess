import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../app/store";
import HelperVisual from "../components/HelperVisual";
import * as connectorModule from "../services/connector";

jest.mock("axios", () => ({
    get: jest.fn(() => Promise.resolve({ data: { nodes: [], edges: [] } })),
}));

describe("HelperVisual Component", () => {
    beforeEach(() => {
        (connectorModule.fetchLinks as jest.Mock).mockResolvedValue({
            nodes: [],
            edges: [],
        });
    });

    const defaultProps = {
        displayMode: "letters" as const,
    };

    test("renders HelperVisual component", () => {
        render(
            <Provider store={store}>
                <HelperVisual {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText("Helper Visual")).toBeInTheDocument();
    });

    test("changes selected visual on option change", () => {
        render(
            <Provider store={store}>
                <HelperVisual {...defaultProps} />
            </Provider>
        );

        const selectElement = screen.getByText("No Visual Selected");
        fireEvent.change(selectElement, { target: { value: "Graph View" } });

        expect(screen.getByText("Graph View")).toBeInTheDocument();
    });

    test("renders Chord Diagram when Chord View is selected", () => {
        render(
            <Provider store={store}>
                <HelperVisual {...defaultProps} />
            </Provider>
        );

        const selectElement = screen.getByText("No Visual Selected");
        fireEvent.change(selectElement, { target: { value: "Chord View" } });

        expect(screen.getByText("Chord View")).toBeInTheDocument();
    });

    test("renders History Table when History Table is selected", () => {
        render(
            <Provider store={store}>
                <HelperVisual {...defaultProps} />
            </Provider>
        );

        const selectElement = screen.getByText("No Visual Selected");
        fireEvent.change(selectElement, { target: { value: "History Table" } });

        expect(screen.getByText("Ply")).toBeInTheDocument();
    });

    test("renders FEN Character Count when FEN Character Count is selected", () => {
        render(
            <Provider store={store}>
                <HelperVisual {...defaultProps} />
            </Provider>
        );

        const selectElement = screen.getByText("No Visual Selected");
        fireEvent.change(selectElement, {
            target: { value: "FEN Character Count" },
        });

        expect(screen.getByText("Move 0")).toBeInTheDocument();
    });
});
