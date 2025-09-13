import { PlanNode } from "./types";

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
}

export class PlanParser {
  private static nodeCounter = 0;

  static parsePlan(plan: PlanNode, parentId?: string, depth = 0): NodeInfo {
    this.nodeCounter = 0;
    return this.convertNode(plan, parentId, depth);
  }

  private static convertNode(
    node: PlanNode,
    parentId?: string,
    depth = 0,
  ): NodeInfo {
    const id = `node-${++this.nodeCounter}`;

    console.log(`Processing node at depth ${depth}: ${node["Node Type"]}`);
    console.log(`Node has ${node.Plans?.length || 0} children`);

    const single_node: NodeInfo = {
      id,
      nodeType: node["Node Type"],
      relationName: node["Relation Name"],
      totalCost: node["Total Cost"] || 0,
      startupCost: node["Startup Cost"] || 0,
      planRows: node["Plan Rows"] || 0,
      actualRows: node["Actual Rows"],
      actualTime: node["Actual Total Time"],
      children: [],
      filter: node.Filter || node["Join Filter"],
      indexName: node["Index Name"],
      joinType: node["Join Type"],
      depth,
      parentId,
    };

    // Recursively process children
    if (node.Plans && node.Plans.length > 0) {
      console.log(
        `Converting ${node.Plans.length} children for ${node["Node Type"]}`,
      );
      single_node.children = node.Plans.map((child_plan: PlanNode) =>
        this.convertNode(child_plan, id, depth + 1),
      );
    }

    return single_node;
  }
  static getTreeLinks(
    root_node: NodeInfo,
  ): Array<{ source: string; target: string }> {
    const links: Array<{ source: string; target: string }> = [];

    const traverse = (node: NodeInfo): void => {
      node.children.forEach((child) => {
        links.push({
          source: node.id,
          target: child.id,
        });
        traverse(child);
      });
    };
    traverse(root_node);
    return links;
  }

  static getExecutionOrder(root_node: NodeInfo): NodeInfo[] {
    const execution_order: NodeInfo[] = [];

    const traverse = (node: NodeInfo): void => {
      node.children.forEach((child) => traverse(child));
      execution_order.push(node);
    };
    traverse(root_node);
    return execution_order;
  }
  static getNodeStats(nodes: NodeInfo[]) {
    const costs = nodes.map((n) => n.totalCost).filter((c) => c > 0);
    const rows = nodes.map((n) => n.planRows).filter((r) => r > 0);
    const actual_rows = nodes
      .map((n) => n.actualRows)
      .filter((r) => r !== undefined && r > 0) as number[];

    const total_cost = costs.reduce((a, b) => a + b, 0);

    return {
      maxCost: costs.length > 0 ? Math.max(...costs) : 0,
      minCost: costs.length > 0 ? Math.min(...costs) : 0,
      maxRows: rows.length > 0 ? Math.max(...rows) : 0,
      minRows: rows.length > 0 ? Math.min(...rows) : 0,
      maxActualRows: actual_rows.length > 0 ? Math.max(...actual_rows) : 0,
      avgCost:
        costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0,
      totalCost: total_cost,
      totalNodes: nodes.length,
    };
  }

  static getNodeDescription(node: NodeInfo): string {
    let description = node.nodeType;

    if (node.relationName) {
      description += ` on ${node.relationName}`;
    }

    if (node.indexName) {
      description += ` using ${node.indexName}`;
    }

    if (node.joinType) {
      description += ` (${node.joinType})`;
    }

    if (node.filter) {
      description += ` with filter`;
    }

    return description;
  }

  static findBottlenecks(nodes: NodeInfo[], threshold = 0.8): NodeInfo[] {
    const max_cost = Math.max(...nodes.map((n) => n.totalCost));
    return nodes.filter((n) => n.totalCost >= max_cost * threshold);
  }

  static flattenTree(rootNode: NodeInfo): NodeInfo[] {
    const nodes: NodeInfo[] = [rootNode];

    const traverse = (node: NodeInfo): void => {
      node.children.forEach((child) => {
        nodes.push(child);
        traverse(child);
      });
    };

    traverse(rootNode);
    return nodes;
  }
}
