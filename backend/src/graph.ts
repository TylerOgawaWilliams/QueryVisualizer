import {
  Node,
  NodeInfo,
  NodeData,
  Edge,
  NodeType,
  ScanNodeData,
  JoinNodeData,
  Graph,
  TableNodeInfo,
  TableNodeData,
  Attribute,
  AggregateNodeData,
} from "./types/nodeTypes";
import { Tables } from "./tables";

export class QueryGraph {
  private static default_pos = { x: 0, y: 0 };
  private tables: Tables;
  private links: Array<{ source: string, target: string }>;

  constructor(tables: Tables, links: Array<{ source: string; target: string }> ) {
    this.tables = tables;
    this.links = links;
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
      case "Aggregate":
        return NodeType.AGGREGATE;
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

      const contains_relation = col.includes('.');
      const curCol = contains_relation ? col.split(/\./)[1] : col;

      const type = this.tables.getKeyType(node_info.relationName, curCol);
      const isPk = this.tables.isPrimaryKey(node_info.relationName, curCol);
      const isFk = this.tables.isForeignKey(node_info.relationName, curCol);

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
      rowCount: node_info.actualRows
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
      const currCol = colSplit[1];
      const currRelation = this.tables.getRelationFromAlias(colSplit[0]);
      console.log(currRelation)

      const type = this.tables.getKeyType(currRelation, currCol);
      const isPk = this.tables.isPrimaryKey(currRelation, currCol);
      const isFk = this.tables.isForeignKey(currRelation, currCol);

      const attribute : Attribute = {
        name: col,
        type: type ?? "",
        keyType: isPk && isFk ? "PK, FK" : isPk ? "PK" : isFk ? "FK" : undefined
      }

      return attribute;
    }) ?? [];
    
    const table : TableNodeData = {
      depth: node_info.depth,
      name : "",
      attributes: attributes,
      rowCount: node_info.actualRows
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
        hashCond: node_info.hashCond ?? 'unknown',
        mergeCond: node_info.mergeCond ?? 'unknown',
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

  private createAggregateNode(node_info: NodeInfo) : Node {
    const data : AggregateNodeData = {
        depth: node_info.depth,
        name: node_info.nodeType,
        startUpCost: node_info.startupCost,
        totalCost: node_info.totalCost,
        filter: node_info.filter,
        groupBy: node_info.groupKey,
        columns: node_info.output
    };

    const node: Node = {
      id: node_info.id,
      type: NodeType.AGGREGATE,
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

    const node_dict = new Map<string, Node>();

    var offset = 0;
    for (const n of table_nodes) {
      const node = this.createTableNode(n);
      node.position = { x: 0, y: offset };
      offset += n.columns.length * 35 + 100;
      node_dict.set(node.id,node);
      const edge = this.createEdge(n.id, n.targetNode);
      nodes.push(node);
      edges.push(edge);
    }

    var max_depth = 0;
    for (const n of node_info) {
        if(n.depth > max_depth) {
            max_depth = n.depth;         
        }
    }

    console.log("Max depth of tree: ", max_depth);

    for (const n of node_info) {
      n.depth = Math.abs(n.depth - max_depth) + 1;
      console.log("New depth: ", n.depth);
      switch (this.getNodeType(n)) {
        case NodeType.SCAN:
          const scan_node = this.createScanNode(n);
          scan_node.position = { x: n.depth * 300, y: 0};
          node_dict.set(scan_node.id, scan_node);
          nodes.push(scan_node);
          break;
        case NodeType.JOIN:
          const join_node = this.createJoinNode(n);
          node_dict.set(join_node.id, join_node);
          join_node.position = { x: n.depth * 300, y: 0};
          nodes.push(join_node);
          break;
        case NodeType.AGGREGATE:
          const agg_node = this.createAggregateNode(n);
          agg_node.position = {x: n.depth * 300, y:0};
          nodes.push(agg_node);
          break;
        case NodeType.MINI:
          const mini_node = this.createMiniNode(n); 
          node_dict.set(mini_node.id, mini_node);
          mini_node.position = { x: n.depth * 300, y: 0};
          nodes.push(mini_node);
          break;
        case NodeType.NONE:
        default:
          console.log(`Node type not yet implemented for: ${n.nodeType}`);
      }
    }

    for (const n of this.links) {
        const edge = this.createEdge(n.target, n.source);
        edges.push(edge);
    }

    for (const edge of edges) {
        console.log("Edge: ", edge.source, edge.target);
        const target_node = node_dict.get(edge.target);
        if(!target_node) {
            console.error(`Target node: ${edge.target} missing`);
            continue;
        }
        const source_node = node_dict.get(edge.source);
        if(!source_node) {
            console.error(`Source node: ${edge.source} missing`);
            continue;
        }
        console.log("Target node id: ", target_node.id);
        console.log("Source node id: ", source_node.id);
        console.log("Target node type: ", target_node.type);
        console.log(`Source node y pos: ${source_node.position.y}`);
        console.log(`Target node y pos: ${target_node.position.y}`);
        if(target_node.type != "Mini") {
            target_node.position.y = source_node.position.y;
        }
        else {
            target_node.position.y = source_node.position.y + 100;
        }
    }

    return { nodes: nodes, edges: edges };
  }
}

