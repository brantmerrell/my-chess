import React, { useState, useEffect } from "react";
import "./KeybindingIndicators.css";

const KeybindingIndicators: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const keybindings = [
    { key: "j", description: "Scroll down" },
    { key: "k", description: "Scroll up" },
    { key: "]", description: "Zoom in" },
    { key: "[", description: "Zoom out" },
    { key: "f", description: "Focus position selector" },
    { key: "F", description: "Focus FEN input" },
    { key: "?", description: "Toggle shortcuts panel" },
    { key: "Esc", description: "Unfocus current element" },
  ];

  // Listen for ? key to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        setIsExpanded((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isExpanded) {
    return (
      <div
        className="keybinding-hint"
        onClick={() => setIsExpanded(true)}
        title="Click or press ? to show keyboard shortcuts"
      >
        Press ? for shortcuts
      </div>
    );
  }

  return (
    <div className="keybinding-indicators" onClick={() => setIsExpanded(false)}>
      <div className="keybinding-header">Keyboard Shortcuts</div>
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
