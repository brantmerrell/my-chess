import { useSelector } from "react-redux";
import React from "react";
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import {
  CHESS_SETUPS,
  getSetupById,
  getSetupsByCategory,
  StaticPositionSetup,
} from "../../models/SetupOptions";
import { setSelectedSetup } from "../../reducers/setups/setups.actions";
import { BootstrapTheme } from "../controls/ThemeSelector";
import "./SelectPosition.css";

interface SelectPositionProps {
  theme: BootstrapTheme;
  setFen: (fen: string) => void;
}

const SelectPosition: React.FC<SelectPositionProps> = ({
  theme,
  setFen
}) => {
  const dispatch = useAppDispatch();
  const selectedSetup = useSelector((state: RootState) => state.selectedSetup);

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const setupId = event.target.value;

    const setup = getSetupById(setupId);

    if (setup) {
      dispatch(setSelectedSetup(setupId));

      if (setup instanceof StaticPositionSetup) {
        setFen(setup.getFen());
      } else {
        setup.load(dispatch);
      }
    }
  };

  return (
    <div className="position-layout">
      <select
        aria-label="Position Selection"
        id="position-selector"
        className={`dropdown-toggle position-select btn btn-secondary position-select--${theme}`}
        value={selectedSetup}
        onChange={handleOptionChange}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            // Try showPicker() if available, otherwise simulate click
            const selectElement = e.currentTarget as HTMLSelectElement;
            if (
              "showPicker" in selectElement &&
              typeof selectElement.showPicker === "function"
            ) {
              try {
                selectElement.showPicker();
              } catch (error) {
                // Fallback to click if showPicker fails
                selectElement.click();
              }
            } else {
              selectElement.click();
            }
          }
        }}
      >

        {/* Regular setups (no category) */}
        {CHESS_SETUPS.filter((setup) => !setup.category).map((setup) => (
          <option key={setup.id} value={setup.id}>
            {setup.displayName}
          </option>
        ))}

        {/* Categorized setups */}
        {Array.from(
          new Set(CHESS_SETUPS.map((s) => s.category).filter(Boolean)),
        ).map((category) => (
          <optgroup key={category} label={category}>
            {getSetupsByCategory(category!).map((setup) => (
              <option key={setup.id} value={setup.id}>
                {setup.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default SelectPosition;
