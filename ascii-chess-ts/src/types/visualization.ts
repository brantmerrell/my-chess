import * as d3 from "d3";

export type ConnectionType = "none" | "adjacencies" | "links" | "king_box";

export interface AdjacenciesResponse {
  [square: string]: string[];
}

export interface LinkNode extends d3.SimulationNodeDatum {
  square: string;
  piece_type: string;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LinkEdge extends d3.SimulationLinkDatum<LinkNode> {
  type: string;
  source: LinkNode;
  target: LinkNode;
}

export interface LinksResponse {
  nodes: LinkNode[];
  edges: LinkEdge[];
}

export interface ProcessedEdge {
  source: string;
  target: string;
  type: string;
}

export interface EdgeSource {
  square: string;
}

export interface EdgeData {
  source: string | EdgeSource;
  target: string | EdgeSource;
  type: string;
}
