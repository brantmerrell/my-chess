export const arrowheadColors: Record<string, string> = {
  arrowheadThreat: "crimson",
  arrowheadProtection: "green",
  arrowheadCasterThreat: "crimson",
  arrowheadCasterProtection: "cyan",
  arrowheadShadowThreat: "crimson",
  arrowheadShadowProtection: "forestgreen",
  arrowheadAdjacency: "dodgerblue",
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
      return { color: "crimson", marker: "url(#arrowheadThreat)" };
    case "protection":
      return { color: "forestgreen", marker: "url(#arrowheadProtection)" };
    case "adjacency":
      return { color: "dodgerblue", marker: "url(#arrowheadAdjacency)" };
    case "caster_threat":
      return { color: "crimson", marker: "url(#arrowheadCasterThreat)" };
    case "caster_protection":
      return { color: "dimgray", marker: "url(#arrowheadCasterProtection)" };
    case "shadow_threat":
      return { color: "crimson", marker: "url(#arrowheadShadowThreat)" };
    case "shadow_protection":
      return { color: "forestgreen", marker: "url(#arrowheadShadowProtection)" };
    case "king_can_move":
      return { color: "green", marker: "url(#arrowheadProtection)" };
    case "king_blocked_ally":
      return { color: "darkgoldenrod", marker: "" };
    case "king_blocked_threat":
      return { color: "darkgoldenrod", marker: "" };
    default:
      return { color: "darkgoldenrod", marker: "url(#arrowheadGray)" };
  }
};
