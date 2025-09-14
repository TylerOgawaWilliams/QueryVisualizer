export interface GraphResponse {
  graph: Graph;
  error: boolean | string;
}

export interface Graph {
  nodes: Node[],
  edges: Edge[]
}

export interface Node {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

export interface NodeData {
  depth: number,
  name?: string
}

export interface SourceNodeData extends NodeData {
  columns?: string[]
}

export interface SeqScanNodeData extends NodeData {
  columns?: string[]
}

export type NodeType = 'source' | 'seq_scan' | 'none';

export interface Edge {
  id: string;
  source: string;
  target: string;
}