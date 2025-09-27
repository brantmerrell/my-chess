import React from "react";
import "./KeybindingIndicators.css";

const KeybindingIndicators: React.FC = () => {
  const keybindings = [
    { key: "j", description: "Scroll down" },
    { key: "k", description: "Scroll up" },
    { key: "+", description: "Increase container height" },
    { key: "-", description: "Decrease container height" },
    { key: "f", description: "Focus position selector" },
    { key: "F", description: "Focus FEN input" },
    { key: "T", description: "Focus theme selector" },
    { key: "?", description: "Toggle shortcuts panel" },
    { key: "Esc", description: "Unfocus current element" },
  ];

  return (
    <div className="keybinding-indicators">
      <div className="keybinding-header">Other Shortcuts</div>
      <div className="keybinding-list">
        {keybindings.map((binding) => (
          <div key={binding.key} className="keybinding-item">
            <span className="keybinding-key">{binding.key}</span>
            <span className="keybinding-description">
              {binding.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeybindingIndicators;
