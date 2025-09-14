import { type NodeProps, Handle, Position } from "reactflow";
import type { SeqScanNodeData, SourceNodeData } from "../../types";
import "./nodes.css"

export function SourceNode({ data }: NodeProps<SourceNodeData>) {
    return (
        <>
            <div className="node">
                <h1>{data.name}</h1>
                { data.columns?.map((col) => {
                    return (<p key={col}> {col} </p>)
                }) }
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )
}

export function SeqScanNode({ data }: NodeProps<SeqScanNodeData>) {
    return (
        <>
            <Handle 
                type="target"
                position={Position.Left}
            />
            <div className="node">
                <h1>{data.name}</h1>
                { data.columns?.map((col) => {
                    return (<p key={col}> {col} </p>)
                }) }
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )
}