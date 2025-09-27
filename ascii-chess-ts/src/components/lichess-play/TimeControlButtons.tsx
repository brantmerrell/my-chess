import React from "react";

export interface TimeControl {
  minutes: number;
  increment: number;
  label: string;
  category: "rapid" | "classical";
}

interface TimeControlButtonsProps {
  onTimeControlSelect: (timeControl: TimeControl) => void;
  disabled?: boolean;
}

const TimeControlButtons: React.FC<TimeControlButtonsProps> = ({
  onTimeControlSelect,
  disabled = false,
}) => {
  const timeControls: TimeControl[] = [
    { minutes: 10, increment: 0, label: "10+0 Rapid", category: "rapid" },
    { minutes: 10, increment: 5, label: "10+5 Rapid", category: "rapid" },
    { minutes: 15, increment: 10, label: "15+10 Rapid", category: "rapid" },
    {
      minutes: 30,
      increment: 0,
      label: "30+0 Classical",
      category: "classical",
    },
    {
      minutes: 30,
      increment: 20,
      label: "30+20 Classical",
      category: "classical",
    },
  ];

  return (
    <div className="quick-pairing">
      <span className="quick-pairing-label">Quick Pairing:</span>
      <div className="time-control-buttons">
        {timeControls.map((tc) => (
          <button
            key={tc.label}
            className={`btn btn-${tc.category === "rapid" ? "info" : "primary"} time-control-btn`}
            onClick={() => onTimeControlSelect(tc)}
            disabled={disabled}
          >
            {tc.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeControlButtons;
