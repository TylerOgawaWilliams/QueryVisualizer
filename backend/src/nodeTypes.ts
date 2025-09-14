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
  depth: number;
  name?: string;
}

export interface SourceNodeData extends NodeData {
  columns?: string[];
}

export interface SeqScanNodeData extends NodeData {
  columns?: string[];
}

export interface IndexScanNodeData extends NodeData {
  columns?: string[];
}

export interface MemoizeNodeData extends NodeData {
  columns?: string[];
}

export interface MaterializeNodeData extends NodeData {
  columns?: string[];
}

export interface NestedLoopNodeData extends NodeData {
  columns?: string[];
}

export enum NodeType {
  SOURCE = "source",
  SEQ_SCAN = "seq_scan",
  INDEX_SCAN = "index_scan",
  NESTED_LOOPS = "nested_loop",
  MATERIALIZE = "materialize",
  MEMOIZE = "memoize",
  LIMIT = "limit",
  NONE = "none",
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}
