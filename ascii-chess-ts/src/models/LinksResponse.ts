export interface LinkNode {
  square: string;
  piece_type: string;
  color: string;
  x?: number;
  y?: number;
  fy?: number;
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

