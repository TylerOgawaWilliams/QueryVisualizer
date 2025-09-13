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

export interface Node {
  id: string;
  type: NodeType;
  position: {
    x: number,
    y: number
  };
  data: any;
}

export interface NodeType {
  "seq-scan": string;
}
