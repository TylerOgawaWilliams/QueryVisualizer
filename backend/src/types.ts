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
  "Output"?: string[];
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

export interface ExplainRequest {
  query: string;
}

export interface ExplainResponse {
  success: boolean;
  plan?: {
    tree: any;
    nodes: any[];
    links: Array<{ source: string; target: string }>;
    stats: {
      maxCost: number;
      minCost: number;
      maxRows: number;
      minRows: number;
      maxActualRows: number;
      avgCost: number;
      totalCost: number;
    };
    executionOrder: any[];
    bottlenecks: any[];
    originalQuery: string;
  };
  error?: string;
}

export interface GraphRequest {
  query: string;
}

export interface GraphResponse {
  graph: Graph;
  error: boolean | string;
}

export interface SampleQuery {
  name: string;
  query: string;
}

export interface ExecuteResponse {
  success: boolean;
  rows?: any[];
  rowCount?: number;
  fields?: Array<{ name: string; dataType: number }>;
  error?: string;
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

export enum NodeType {
  SOURCE = 'source',
  SEQ_SCAN = 'seq_scan',
  NONE = 'none'
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface DatabaseUploadRequest {
  databaseName: string;
}

export interface DatabaseUploadResponse {
  success: boolean;
  message?: string;
  filename?: string;
  error?: string;
}

export interface CurrentDatabaseResponse {
  success: boolean;
  currentDatabase: string;
}
