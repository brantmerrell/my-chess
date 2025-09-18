import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./VerticalResizer.css";

interface VerticalResizerProps {
  children: React.ReactNode;
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface VerticalResizerHandle {
  increaseHeight: (amount?: number) => void;
  decreaseHeight: (amount?: number) => void;
  setHeight: (newHeight: number) => void;
}

const VerticalResizer = forwardRef<VerticalResizerHandle, VerticalResizerProps>(
  (
    {
      children,
      initialHeight = 500,
      minHeight = 300,
      maxHeight = window.innerHeight * 0.8,
    },
    ref,
  ) => {
    const [height, setHeight] = useState(initialHeight);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        increaseHeight: (amount = 50) => {
          setHeight((prev) => Math.min(prev + amount, maxHeight));
        },
        decreaseHeight: (amount = 50) => {
          setHeight((prev) => Math.max(prev - amount, minHeight));
        },
        setHeight: (newHeight: number) => {
          setHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)));
        },
      }),
      [minHeight, maxHeight],
    );

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = e.clientY - containerRect.top;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
        }
      },
      [isDragging, minHeight, maxHeight],
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "ns-resize";
        document.body.style.userSelect = "none";

        return () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
      <div
        className="vertical-resizer-container"
        ref={containerRef}
        style={{ height: `${height}px` }}
      >
        <div className="vertical-resizer-content">{children}</div>
        <div
          className={`vertical-resizer-handle ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleMouseDown}
        >
          <div className="vertical-resizer-grip" />
        </div>
      </div>
    );
  },
);

VerticalResizer.displayName = "VerticalResizer";

export default VerticalResizer;
