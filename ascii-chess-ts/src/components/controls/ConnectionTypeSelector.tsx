import React from "react";
import { ConnectionType } from "../../types/visualization";

interface ConnectionTypeSelectorProps {
  connectionType: ConnectionType;
  onConnectionTypeChange: (type: ConnectionType) => void;
}

const CONNECTION_TYPE_OPTIONS = [
  { value: "none", label: "(N)one" },
  { value: "adjacencies", label: "(A)djacencies" },
  { value: "links", label: "L(i)nks" },
  { value: "king_box", label: "Kin(g) Box" },
  // shadow
] as const;

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = ({
  connectionType,
  onConnectionTypeChange,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Connection Type</label>
      <div className="connection-type-radio-group">
        {CONNECTION_TYPE_OPTIONS.map((option) => (
          <div key={option.value} className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="connection-type"
              id={`connection-type-${option.value}`}
              value={option.value}
              checked={connectionType === option.value}
              onChange={() =>
                onConnectionTypeChange(option.value as ConnectionType)
              }
            />
            <label
              className="form-check-label"
              htmlFor={`connection-type-${option.value}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionTypeSelector;
