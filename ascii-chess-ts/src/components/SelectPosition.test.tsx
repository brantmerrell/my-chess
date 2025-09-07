import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../app/store";
import SelectPosition from "../components/SelectPosition";

test("renders SelectPosition component", () => {
  const mockSetFen = jest.fn();
  render(
    <Provider store={store}>
      <SelectPosition theme="cyborg" setFen={mockSetFen} />
    </Provider>,
  );

  expect(screen.getByRole("combobox")).toBeInTheDocument();
});

test("changes selected setup on option change", () => {
  const mockSetFen = jest.fn();
  render(
    <Provider store={store}>
      <SelectPosition theme="cyborg" setFen={mockSetFen} />
    </Provider>,
  );

  const selectElement = screen.getByRole("combobox");
  fireEvent.change(selectElement, {
    target: { value: "lichess-daily-puzzle" },
  });

  const selectedValue = store.getState().selectedSetup;
  expect(selectedValue).toBe("lichess-daily-puzzle");
});
