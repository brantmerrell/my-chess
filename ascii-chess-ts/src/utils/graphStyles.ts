export const arrowheadColors: Record<string, string> = {
  arrowheadThreat: "crimson",
  arrowheadProtection: "dimgray",
  arrowheadAdjacency: "dodgerblue",
  arrowheadGray: "gray",
};

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
      return { color: "crimson", marker: "url(#arrowheadThreat)" };
    case "protection":
      return { color: "dimgray", marker: "url(#arrowheadProtection)" };
    case "adjacency":
      return { color: "dodgerblue", marker: "url(#arrowheadAdjacency)" };
    case "king_can_move":
      return { color: "green", marker: "url(#arrowheadProtection)" };
    case "king_blocked_ally":
      return { color: "dimgray", marker: "" };
    case "king_blocked_threat":
      return { color: "darkgoldenrod", marker: "" };
    default:
      return { color: "darkgoldenrod", marker: "url(#arrowheadGray)" };
  }
};
