import { Graph } from "./nodeTypes";

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
