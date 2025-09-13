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
}

export interface ExplainRequest {
  query: string;
}

export interface ExplainResponse {
  success: boolean;
  plan?: any;
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
