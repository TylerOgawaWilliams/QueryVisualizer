import { type NodeProps, Handle, Position } from "reactflow";
import type { SortNodeData } from "../../types";
import "./sortNode.css"
import { InnerTableNode } from "./TableNode";

export function SortNode({ data }: NodeProps<SortNodeData>) {
    return (
        <>
            <Handle 
                type="target"
                position={Position.Left}
            />
            <div className="sort node">
                <div className="node-type"> <h3>Sort</h3> </div>
                <div className="contents">
                    <div className="name"> <h1>{data.name}</h1> </div>
                    <div className="startup-cost">
                        <p>Startup Cost: </p>
                        <p><span>{data.startUpCost}</span></p>
                    </div>
                    <div className="hline-gray"></div>
                    <div className="total-cost">
                        <p>Total Cost: </p>
                        <p><span>{data.totalCost}</span></p>
                    </div>
                    {data.sortMethod && (
                        <>
                            <div className="hline-black"></div>
                            <div className="sort-method">
                                <p>Sort Method:</p>
                                <div>
                                    <p><span>{data.sortMethod}</span></p>
                                </div>
                            </div>
                        </>
                    )}
                    {data.sortKey && (
                        <>
                            <div className="hline-black"></div>
                            <div className="sort-key">
                                <p>Sort Key:</p>
                                <div>
                                    <p><span>{Array.isArray(data.sortKey) ? data.sortKey.join(', ') : data.sortKey}</span></p>
                                </div>
                            </div>
                        </>
                    )}
                    <InnerTableNode data={data.table}/>
                </div>
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )
}
