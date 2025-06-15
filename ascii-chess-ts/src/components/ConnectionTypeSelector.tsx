import React from "react";
import { ConnectionType } from "../types/visualization";
import "./SelectStyle.css";

interface ConnectionTypeSelectorProps {
    connectionType: ConnectionType;
    onConnectionTypeChange: (type: ConnectionType) => void;
}

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = ({
    connectionType,
    onConnectionTypeChange,
}) => {
    return (
        <div className="selector-wrapper">
            <label className="selector-label text-info">Connection Type</label>
            <div className="selector-container">
                <select
                    value={connectionType}
                    onChange={(e) => onConnectionTypeChange(e.target.value as ConnectionType)}
                    className="select-control btn btn-info"
                    aria-label="Connection Type Selection"
                >
                    <option value="links">Links</option>
                    <option value="adjacencies">Adjacencies</option>
                </select>
            </div>
        </div>
    );
};

export default ConnectionTypeSelector;

