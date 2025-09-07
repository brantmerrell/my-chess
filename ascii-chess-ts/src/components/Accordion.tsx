import React from "react";
import { BootstrapTheme } from "./ThemeSelector";
import "./Accordion.css";

interface AccordionProps {
  title: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: BootstrapTheme;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
  theme,
  className = "",
}) => {
  return (
    <div className={`accordion ${className}`}>
      <button
        className={`accordion-header accordion-header--${theme}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${typeof title === "string" ? title.replace(/\s+/g, "-").toLowerCase() : "accordion"}`}
      >
        <span className={`accordion-chevron ${isExpanded ? "expanded" : ""}`}>
          ▶
        </span>
        <span className={`accordion-title accordion-title--${theme}`}>
          {title}
        </span>
      </button>
      <div
        id={`accordion-content-${typeof title === "string" ? title.replace(/\s+/g, "-").toLowerCase() : "accordion"}`}
        className={`accordion-content ${isExpanded ? "expanded" : "collapsed"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Accordion;
