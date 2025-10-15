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
import { SeqScanNode, SourceNode } from './Nodes';

const nodeTypes = {
    source: SourceNode,
    seq_scan: SeqScanNode
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
