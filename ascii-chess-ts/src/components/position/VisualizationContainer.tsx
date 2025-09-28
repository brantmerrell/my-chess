import React, { forwardRef } from "react";
import "./VisualizationContainer.css";

interface VisualizationContainerProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
  withPadding?: boolean;
}

/**
 * Reusable container component for all chess visualizations.
 * Provides consistent styling and layout for GraphView, ArcView, HistoricalArcView, etc.
 */
const VisualizationContainer = forwardRef<
  HTMLDivElement,
  VisualizationContainerProps
>(
  (
    { children, className = "", centered = false, withPadding = false },
    ref,
  ) => {
    const containerClasses = [
      "visualization-container",
      centered && "visualization-container--centered",
      withPadding && "visualization-container--with-padding",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses} ref={ref}>
        {children}
      </div>
    );
  },
);

VisualizationContainer.displayName = "VisualizationContainer";

export default VisualizationContainer;
