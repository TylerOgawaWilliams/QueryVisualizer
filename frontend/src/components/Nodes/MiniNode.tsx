import { type NodeProps, Handle, Position } from "reactflow";
import type { NodeData } from "../../types";
import "./miniNode.css"

export function MiniNode({ data }: NodeProps<NodeData>) {
    return (
        <>
            <Handle 
                type="target"
                position={Position.Left}
            />
            <div className="mini node">
                <div className="node-type"> <h2>{data.name}</h2> </div>
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )
}
