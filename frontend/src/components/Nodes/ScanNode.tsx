import { type NodeProps, Handle, Position } from "reactflow";
import type { ScanNodeData } from "../../types";
import "./scanNode.css"

export function ScanNode({ data }: NodeProps<ScanNodeData>) {
    const getFilter = () => {
        if (data.filter && data.indexCond) {
            return `${data.filter} AND ${data.indexCond}`;
        } else if (data.filter) {
            return data.filter;
        } else if (data.indexCond) {
            return data.indexCond;
        } else {
            return undefined
        }
    }

    const filter = getFilter();

    return (
        <>
            <Handle 
                type="target"
                position={Position.Left}
            />
            <div className="scan node">
                <div className="node-type"> <h3>Scan</h3> </div>
                <div className="contents">
                    <div className="name"> <h1>{data.name}</h1> </div>
                    <div className="startup-cost">
                        <p>Startup Cost: </p>
                        <p>{data.startUpCost}</p>
                    </div>
                    <div className="total-cost">
                        <p>Total Cost: </p>
                        <p>{data.totalCost}</p>
                    </div>
                    <div className="hline"> </div>
                    { filter && (
                        <div className="filter">
                            <p>Filter/Condition: </p>
                            <div>
                                <p><span>{filter}</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )
}