import React from "react";
import "./SelectStyle.css";

interface SelectorOption {
    readonly value: string;
    readonly label: string;
}

interface SelectorProps<T extends string> {
    id: string;
    label: string;
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
    className = ""
}: SelectorProps<T>) {
    return (
        <div className={`selector-wrapper ${className}`}>
            <label className="selector-label text-info" htmlFor={id}>
                {label}
            </label>
            <div className="selector-container">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value as T)}
                    className="select-control btn btn-info"
                    aria-label={ariaLabel || `${label} Selection`}
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