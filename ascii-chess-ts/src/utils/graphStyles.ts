export const getNodeStyle = (color: string) => {
  return {
    background: color === "white" ? "black" : "white",
    fill: color === "white" ? "white" : "black",
    stroke: color === "white" ? "white" : "black",
  };
};

export const getEdgeStyle = (edgeType: string) => {
  switch (edgeType) {
    case "threat":
      return { color: "crimson", marker: "url(#arrowheadRed)" };
    case "protection":
      return { color: "forestgreen", marker: "url(#arrowheadGreen)" };
    case "adjacency":
      return { color: "dodgerblue", marker: "url(#arrowheadBlue)" };
    case "king_can_move":
      return { color: "green", marker: "url(#arrowheadGreen)" };
    case "king_blocked_ally":
      return { color: "dimgray", marker: "" };
    case "king_blocked_threat":
      return { color: "darkgoldenrod", marker: "" };
    default:
      return { color: "darkgoldenrod", marker: "url(#arrowheadGray)" };
  }
};
