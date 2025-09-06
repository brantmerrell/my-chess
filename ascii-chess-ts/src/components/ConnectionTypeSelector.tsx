import React from "react";
import { ConnectionType } from "../types/visualization";
import Selector from "./Selector";

interface ConnectionTypeSelectorProps {
    connectionType: ConnectionType;
    onConnectionTypeChange: (type: ConnectionType) => void;
}

const CONNECTION_TYPE_OPTIONS = [
    { value: "links", label: "Links" },
    { value: "adjacencies", label: "Adjacencies" }
] as const;

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = ({
    connectionType,
    onConnectionTypeChange,
}) => {
    return (
        <Selector
            id="connection-type-selector"
            label={<span><u>C</u>onnection Type</span>}
            value={connectionType}
            onChange={onConnectionTypeChange}
            options={CONNECTION_TYPE_OPTIONS}
        />
    );
};

export default ConnectionTypeSelector;
