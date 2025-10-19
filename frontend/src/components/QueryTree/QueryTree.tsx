import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from 'reactflow';

import 'reactflow/dist/style.css';
import './queryTree.css';
import { fetchGraph } from '../../helpers/api';
import { TableNode } from '../Nodes/TableNode';
import { ScanNode } from '../Nodes/ScanNode';
import { JoinNode } from '../Nodes/JoinNode';
import { SortNode } from '../Nodes/SortNode';
import { MiniNode } from '../Nodes/MiniNode';
import type { NodeType } from '../../types';
import '../Nodes/nodes.css';
import { AggregateNode } from '../Nodes/AggregateNode';

const nodeTypes: { [key in NodeType]?: React.ComponentType<any> } = {
  Table: TableNode,
  Scan: ScanNode,
  Join: JoinNode,
  Sort: SortNode,
  Aggregate: AggregateNode,
  Mini: MiniNode,
};

export function QueryTree({
  query,
  setError,
}: {
  query: string;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const queryTreeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query === '') return;
    async function graph() {
      const resp = await fetchGraph(query);
      const error = resp.error;

      if (error) {
        setError(error);
      } else {
        const graph = resp.graph;
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setError(undefined);
      }
    }

    try {
      graph();
    } catch (e) {
      console.error(e);
    }
  }, [query, setError, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const toggleFullscreen = useCallback(() => {
    if (!queryTreeRef.current) return;

    if (!document.fullscreenElement) {
      queryTreeRef.current.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="query-tree" ref={queryTreeRef}>
      <button
        onClick={toggleFullscreen}
        className="fullscreen-toggle"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
      >
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
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
