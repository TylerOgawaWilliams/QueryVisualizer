import {
  Node,
  NodeInfo,
  NodeData,
  Edge,
  NodeType,
  ScanNodeData,
  JoinNodeData,
  MergeJoinNodeData,
  HashJoinNodeData,
  HashNodeData,
  Graph,
  TableNodeInfo,
  TableNodeData,
  Attribute,
} from "./nodeTypes";
import { Tables } from "./tables";

export class QueryGraph {
  private static default_pos = { x: 0, y: 0 };
  private tables: Tables;

  constructor(tables: Tables) {
    this.tables = tables;
  }

  private getNodeType(node_info: NodeInfo): NodeType {
    switch (node_info.nodeType) {
      case "Seq Scan":
      case "Index Scan": 
      case "Index Only Scan":
      case "Bitmap Index Scan":
      case "Bitmap Heap Scan": 
        return NodeType.SCAN;
      case "Hash Join":
      case "Merge Join": 
        return NodeType.JOIN;
      case "Hash":
        return NodeType.MINI;
      default:
        if (node_info.nodeType.includes("Scan")) return NodeType.SCAN;
        else if (node_info.nodeType.includes("Join")) return NodeType.JOIN;
        else if (node_info.nodeType.includes("Hash")) return NodeType.MINI;
        return NodeType.NONE;
    }
  }

  private createTableNode(node_info: TableNodeInfo): Node {    
    const data: TableNodeData = {
      depth: node_info.depth,
      name: node_info.relationName,
      attributes: node_info.columns,
      rowCount: node_info.rowCount,
    };

    const node: Node = {
      id: node_info.id,
      type: NodeType.TABLE,
      position: QueryGraph.default_pos,
      data: data,
    };

    return node;
  }

  private createScanNode(node_info: NodeInfo) : Node {
    const attributes = node_info.output?.map((col) => {
      if (!node_info.relationName) {
        return { name: col, type: "", keyType: undefined }
      }

      const type = this.tables.getKeyType(node_info.relationName, col);
      const isPk = this.tables.isPrimaryKey(node_info.relationName, col);
      const isFk = this.tables.isForeignKey(node_info.relationName, col);

      const attribute : Attribute = {
        name: col,
        type: type ?? "",
        keyType: isPk ? "PK" : isFk ? "FK" : undefined
      }

      return attribute;
    }) ?? [];
    
    const table : TableNodeData = {
      depth: node_info.depth,
      name : "",
      attributes: attributes,
      rowCount: node_info.planRows
    }

    const data : ScanNodeData = {
        depth: node_info.depth,
        name: node_info.nodeType,

        startUpCost: node_info.startupCost,
        totalCost: node_info.totalCost,
        filter: node_info.filter,
        indexCond: node_info.indexCond,
        table: table
    }

    const node: Node = {
      id: node_info.id,
      type: NodeType.SCAN,
      position: QueryGraph.default_pos,
      data: data,
    };

    return node;
  }

  private createJoinNode(node_info: NodeInfo) : Node {
    const attributes = node_info.output?.map((col) => {
      const colSplit: string[] = col.split(/\./);

      const currRelation: string = colSplit[0];
      const currCol = colSplit[1];
      console.log(currRelation)

      const type = this.tables.getKeyType(currRelation, currCol);
      const isPk = this.tables.isPrimaryKey(currRelation, currCol);
      const isFk = this.tables.isForeignKey(currRelation, currCol);

      const attribute : Attribute = {
        name: currCol,
        type: type ?? "",
        keyType: isPk ? "PK" : isFk ? "FK" : undefined
      }

      return attribute;
    }) ?? [];
    
    const table : TableNodeData = {
      depth: node_info.depth,
      name : "",
      attributes: attributes,
      rowCount: node_info.planRows
    }

    const data : JoinNodeData = {
        depth: node_info.depth,
        name: node_info.nodeType,
        joinType: node_info.joinType ?? 'unknown',
        innerUnique: node_info.innerUnique ?? 'unknown',
        filter: node_info.filter,
        rowsRemoved: node_info.rowsRemoved ?? 'unknown',
        startUpCost: node_info.startupCost,
        totalCost: node_info.totalCost,
        table: table,
    };

    const node: Node = {
      id: node_info.id,
      type: NodeType.JOIN,
      position: QueryGraph.default_pos,
      data: data,
    };

    return node;

  }

  private createMiniNode(node_info: NodeInfo): Node {
        const data: NodeData = {
            depth: node_info.depth,
            name: node_info.nodeType,
        };

        const node: Node = {
            id: node_info.id,
            type: NodeType.MINI,
            position: QueryGraph.default_pos,
            data: data,
        };

        return node;
    }

  private createEdge(source_id: string, target_id: string): Edge {
    const edge: Edge = {
      id: `e-${source_id}-${target_id}`,
      source: source_id,
      target: target_id,
    };

    return edge;
  }

  public getGraph(
    node_info: NodeInfo[],
    table_nodes: TableNodeInfo[],
  ): Graph {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (const n of table_nodes) {
      const node = this.createTableNode(n);
      const edge = this.createEdge(n.id, n.targetNode);
      nodes.push(node);
      edges.push(edge);
    }

    for (const n of node_info) {
      switch (this.getNodeType(n)) {
        case NodeType.SCAN:
          const scan_node = this.createScanNode(n);
          nodes.push(scan_node);
          break;
        case NodeType.JOIN:
          const join_node = this.createJoinNode(n);
          nodes.push(join_node);
          break;
        case NodeType.MINI:
          const mini_node = this.createMiniNode(n);
          nodes.push(mini_node);
          break;
        case NodeType.NONE:
        default:
          console.log(`Node type not yet implemented for: ${n.nodeType}`);
      }
    }

    return { nodes: nodes, edges: edges };
  }
}

