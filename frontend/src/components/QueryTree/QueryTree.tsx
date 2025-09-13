import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query'
import ReactFlow, {
  MiniMap,
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
import type { Graph } from '../../types';

export function QueryTree() {
  // const [graph, setGraph] = useState();

  useEffect(() => {
    async function graph() {
      const { graph } = await fetchGraph();
      setNodes(graph.nodes);
      setEdges(graph.edges);
    }   
    
    graph();
  }, [])

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
        >
        <MiniMap />
        <Controls />
        <Background />
        </ReactFlow>
    </div>
  );
}