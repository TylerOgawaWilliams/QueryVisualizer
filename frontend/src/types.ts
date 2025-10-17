export interface GraphResponse {
  graph: Graph;
  error: boolean | string;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface Edge {
  id: string;
  source: string;
  target: string;
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

/* Node Types */
export interface NodeData {
  depth: number;
  name: string;
}

export interface Attribute {
  name: string;
  type: string;
  keyType: "PK" | "FK" | "PK, FK" | undefined;
}

export interface TableNodeData extends NodeData {
  attributes: Attribute[];
  rowCount: number;
}

export interface ScanNodeData extends NodeData {
  startUpCost: number;
  totalCost: number;
  filter?: string;
  indexCond?: string;
  table: TableNodeData;
}


export interface JoinNodeData extends NodeData {
  joinType: string;
  innerUnique: string;
  filter?: string;
  rowsRemoved?: string;
  startUpCost: number;
  totalCost: number;
  hashCond?: string; 
  mergeCond?: string;
  table: TableNodeData;
}

export interface AggregateNodeData extends NodeData {
  startUpCost: number;
  totalCost: number;
  filter: string | undefined;
  groupBy: string[] | undefined; 
  columns: string[] | undefined;
}

export type NodeType = "Table" | "Scan" | "Join" | "Aggregate" | "Mini" | "None";