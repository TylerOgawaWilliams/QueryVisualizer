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
  keyType: "PK" | "FK" | undefined;
}

export interface TableNodeData extends NodeData {
  attributes: Attribute[];
  rowCount: number;
}

/* --Scan Nodes-- */
export interface ScanNodeData extends NodeData {
  startUpCost: number;
  totalCost: number;
  filter?: string;
  indexCond?: string;
  table: TableNodeData;
}
/* ---------- */

export type NodeType = "Table" | "Scan" | "Join" | "None";

export interface JoinNodeData extends NodeData {
    joinType: string;
    innerUnique: string;
    filter?: string;
    rowsRemoved?: string;
}

export interface HashJoinNodeData extends JoinNodeData {
    hashCond: string; 
}

export interface MergeJoinNodeData extends JoinNodeData {
    mergeCond: string;
}