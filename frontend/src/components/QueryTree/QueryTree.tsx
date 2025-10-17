import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from 'reactflow';

import 'reactflow/dist/style.css';
import './queryTree.css'
import { fetchGraph } from '../../helpers/api';
import { TableNode } from '../Nodes/TableNode';
import { ScanNode } from '../Nodes/ScanNode';
import { JoinNode } from '../Nodes/JoinNode';
import { MiniNode } from '../Nodes/MiniNode';
import type { NodeType } from '../../types';
import "../Nodes/nodes.css";
import { AggregateNode } from '../Nodes/AggregateNode';

const nodeTypes : { [key in NodeType]?: React.ComponentType<any> } = {
    "Table": TableNode,
    "Scan": ScanNode,
    "Join": JoinNode,
    "Aggregate": AggregateNode,
    "Mini": MiniNode
}

export function QueryTree({ query } : { query : string }) {
  useEffect(() => {
    if (query === "") return;
    async function graph() {
      const { graph } = await fetchGraph(query);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    }   
    
    graph();
  }, [query])

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className='query-tree'>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
        >
          <Controls />
          <Background />
        </ReactFlow>
    </div>
  );
}
