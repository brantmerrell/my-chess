export const arrowheadColors: Record<string, string> = {
  arrowheadThreat: "crimson",
  arrowheadProtection: "green",
  arrowheadCasterThreat: "cornsilk",
  arrowheadCasterProtection: "cornsilk",
  arrowheadShadowThreat: "darkred",
  arrowheadShadowProtection: "forestgreen",
  arrowheadAdjacency: "dodgerblue",
  arrowheadLastMove: "gold",
};

export const getNodeStyle = (color: string) => {
  return {
    background: color === "white" ? "darkslategray" : "lightslategray",
    fill: color === "white" ? "white" : "black",
    stroke: color === "white" ? "white" : "black",
  };
};

export const getEdgeStyle = (edgeType: string) => {
  switch (edgeType) {
    case "threat":
      return { color: "crimson", marker: "url(#arrowheadThreat)", width: 2 };
    case "protection":
      return { color: "forestgreen", marker: "url(#arrowheadProtection)", width: 2 };
    case "adjacency":
      return { color: "dodgerblue", marker: "", width: 6 };
    case "caster_threat":
      return { color: "cornsilk", marker: "url(#arrowheadCasterThreat)", width: 1 };
    case "caster_protection":
      return { color: "cornsilk", marker: "url(#arrowheadCasterProtection)", width: 1 };
    case "shadow_threat":
      return { color: "darkred", marker: "url(#arrowheadShadowThreat)", width: 2 };
    case "shadow_protection":
      return { color: "forestgreen", marker: "url(#arrowheadShadowProtection)", width: 2 };
    case "king_can_move":
      return { color: "forestgreen", marker: "url(#arrowheadProtection)", width: 2 };
    case "king_blocked_ally":
      return { color: "darkgoldenrod", marker: "", width: 2 };
    case "king_blocked_threat":
      return { color: "darkgoldenrod", marker: "", width: 2 };
    default:
      return { color: "darkgoldenrod", marker: "url(#arrowheadGray)", width: 2 };
  }
};
