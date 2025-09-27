import React from "react";
import "./PromotionDialog.css";

interface PromotionDialogProps {
  isOpen: boolean;
  moves: any[];
  onSelect: (move: any) => void;
  onCancel: () => void;
  color: "white" | "black";
}

const PromotionDialog: React.FC<PromotionDialogProps> = ({
  isOpen,
  moves,
  onSelect,
  onCancel,
  color,
}) => {
  if (!isOpen || moves.length === 0) return null;

  const pieceSymbols: { [key: string]: string } = {
    q: color === "white" ? "♕" : "♛",
    r: color === "white" ? "♖" : "♜",
    b: color === "white" ? "♗" : "♝",
    n: color === "white" ? "♘" : "♞",
  };

  const pieceNames: { [key: string]: string } = {
    q: "Queen",
    r: "Rook",
    b: "Bishop",
    n: "Knight",
  };

  return (
    <>
      <div className="promotion-overlay" onClick={onCancel} />
      <div className="promotion-dialog">
        <h3>Choose Promotion</h3>
        <div className="promotion-options">
          {moves.map((move, index) => (
            <button
              key={index}
              className="promotion-button"
              onClick={() => onSelect(move)}
              title={`Promote to ${pieceNames[move.promotion] || "piece"}`}
            >
              <span className="promotion-piece-symbol">
                {pieceSymbols[move.promotion] || "?"}
              </span>
              <span className="promotion-move-notation">{move.san}</span>
            </button>
          ))}
        </div>
        <button className="promotion-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
};

export default PromotionDialog;
