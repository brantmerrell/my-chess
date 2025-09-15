import React from "react";
import { ConnectionType } from "../types/visualization";
import Selector from "./Selector";

interface ConnectionTypeSelectorProps {
  connectionType: ConnectionType;
  onConnectionTypeChange: (type: ConnectionType) => void;
}

const CONNECTION_TYPE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "adjacencies", label: "Adjacencies" },
  { value: "links", label: "Links" },
  { value: "king_box", label: "King Box" },
  // shadow
] as const;

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = ({
  connectionType,
  onConnectionTypeChange,
}) => {
  return (
    <Selector
      id="connection-type-selector"
      label={
        <span>
          Co<u>n</u>nection Type
        </span>
      }
      value={connectionType}
      onChange={onConnectionTypeChange}
      options={CONNECTION_TYPE_OPTIONS}
    />
  );
};

export default ConnectionTypeSelector;
