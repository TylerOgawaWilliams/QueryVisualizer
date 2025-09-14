import {
  Node,
  NodeInfo,
  Edge,
  NodeType,
  SeqScanNodeData,
  Graph,
  SourceNodeInfo,
  SourceNodeData,
} from "./nodeTypes";

export class QueryGraph {
  private static default_pos = { x: 0, y: 0 };

  static getNodeType(node_info: NodeInfo): NodeType {
    switch (node_info.nodeType) {
      case "Seq Scan":
        return NodeType.SEQ_SCAN;
      default:
        return NodeType.NONE;
    }
  }

  static createSourceNode(node_info: SourceNodeInfo): Node {
    const data: SourceNodeData = {
      depth: node_info.depth,
      name: node_info.relationName,
      columns: node_info.columns,
    };

    const node: Node = {
      id: node_info.id,
      type: NodeType.SOURCE,
      position: QueryGraph.default_pos,
      data: data,
    };

    return node;
  }

  static createSeqScanNode(node_info: NodeInfo) : Node {
    const data : SeqScanNodeData = {
        depth: node_info.depth,
        name: 'Seq Scan',
        columns: node_info.output
    }

    const node: Node = {
      id: node_info.id,
      type: NodeType.SEQ_SCAN,
      position: QueryGraph.default_pos,
      data: data,
    };

    return node;
  }

  static createEdge(source_id: string, target_id: string): Edge {
    const edge: Edge = {
      id: `e-${source_id}-${target_id}`,
      source: source_id,
      target: target_id,
    };

    return edge;
  }

  static getGraph(
    node_info: NodeInfo[],
    source_nodes: SourceNodeInfo[],
  ): Graph {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (const n of source_nodes) {
      const node = this.createSourceNode(n);
      const edge = this.createEdge(n.id, n.targetNode);
      nodes.push(node);
      edges.push(edge);
    }

    for (const n of node_info) {
      switch (this.getNodeType(n)) {
        case NodeType.SEQ_SCAN:
          const seq_node = this.createSeqScanNode(n);
          nodes.push(seq_node);
          break;
        case NodeType.NONE:
        default:
          // throw new Error(`Node type not yet implemented for: ${n.nodeType}`);
          console.log(`Node type not yet implemented for: ${n.nodeType}`);
      }
    }

    return { nodes: nodes, edges: edges };
  }
}

