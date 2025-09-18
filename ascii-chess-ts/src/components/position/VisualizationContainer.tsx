import React from "react";
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
const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  children,
  className = "",
  centered = false,
  withPadding = false,
}) => {
  const containerClasses = [
    "visualization-container",
    centered && "visualization-container--centered",
    withPadding && "visualization-container--with-padding",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={containerClasses}>{children}</div>;
};

export default VisualizationContainer;
