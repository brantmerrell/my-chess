import React from "react";
import "./SelectStyle.css";

interface SelectorOption {
  readonly value: string;
  readonly label: string;
}

interface SelectorProps<T extends string> {
  id: string;
  label?: React.ReactNode;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectorOption[];
  ariaLabel?: string;
  className?: string;
}

function Selector<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: SelectorProps<T>) {
  return (
    <div className={`selector-wrapper ${className}`}>
      {label && (
        <label className="selector-label text-info" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="selector-container">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="select-control btn btn-success"
          aria-label={
            ariaLabel ||
            `${typeof label === "string" ? label : "Selector"} Selection`
          }
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
          {options.map(({ value: optionValue, label: optionLabel }) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Selector;
