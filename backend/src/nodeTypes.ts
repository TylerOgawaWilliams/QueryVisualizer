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
  "Index Cond"?: string;
  "Rows Removed by Filter"?: string;
  "Index Name"?: string;
  "Join Type"?: string;
  "Hash Cond"?: string;
  "Sort Key"?: string[];
  "Join Filter"?: string;
  Output?: string[];
  "Inner Unique"?: string; 
  "Merge Cond"?: string;
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
  indexCond?: string;
  rowsRemoved?: string;
  indexName?: string;
  joinType?: string;
  depth: number;
  output?: string[];
  innerUnique?: string;
  hashCond?: string;
  mergeCond?: string;
}

export interface Attribute {
  name: string;
  type: string;
  keyType: "PK" | "FK" | "PK, FK" | undefined;
}

export interface TableNodeInfo {
  id: string;
  targetNode: string;
  relationName: string;
  columns: Attribute[];
  depth: number;
  rowCount: number;
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

export enum NodeType {
  TABLE = "Table",
  SCAN = "Scan",
  JOIN = "Join",
  MINI = "Mini",
  NONE = "None",
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

