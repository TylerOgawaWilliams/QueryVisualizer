import { type NodeProps, Handle, Position } from "reactflow";
import type { ScanNodeData } from "../../types";
import "./scanNode.css"
import { InnerTableNode } from "./TableNode";
import { FormatFilter } from "../../helpers/format";

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

    const filter = FormatFilter(getFilter());

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
                        <p><span>{data.startUpCost}</span></p>
                    </div>
                    <div className="hline-gray"></div>
                    <div className="total-cost">
                        <p>Total Cost: </p>
                        <p><span>{data.totalCost}</span></p>
                    </div>
                    { filter && (
                        <>
                        <div className="hline-black"> </div>
                        <div className="filter">
                            <p>Filter: </p>
                            <div>
                                <p><span>{filter}</span></p>
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
