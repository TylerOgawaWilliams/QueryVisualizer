export interface PlanNode {
  "Node Type": string;
  "Total Cost": number;
  "Relation Name"?: string;
  "Startup Cost": number;
  "Plan Rows": number;
  "Plan Width": number;
  "Actual Total Time"?: number;
  "Actual Startup Time"?: number;
  "Actual Rows"?: number;
  "Actual Loops"?: number;
  Plans?: PlanNode[];
  Filter?: string;
  "Index Name"?: string;
  "Join Type"?: string;
  "Hash Cond"?: string;
  "Sort Key"?: string[];
  "Join Filter"?: string;
  Output?: string[];
}

export interface NodeInfo {
  id: string;
  nodeType: string;
  totalCost: number;
  parentId?: string;
  relationName?: string;
  startupCost: number;
  planRows: number;
  actualRows?: number;
  actualTime?: number;
  children: NodeInfo[];
  filter?: string;
  indexName?: string;
  joinType?: string;
  depth: number;
  output?: string[];
}

export interface SourceNodeInfo {
  id: string;
  targetNode: string;
  relationName: string;
  columns: string[];
  depth: number;
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

export interface TableNodeData extends NodeData {
  sources: string[];
  columns: string[];
}

export interface ScanNodeData extends NodeData {
  scanType: string;
  columns?: string[];
  table: TableNodeData;
}

export enum NodeType {
  TABLE = "table",
  SCAN = "scan",
  JOIN = "join",
  NONE = "none",
}

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
