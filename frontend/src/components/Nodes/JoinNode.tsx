import { type NodeProps, Handle, Position } from "reactflow";
import type { JoinNodeData } from "../../types";
import "./joinNode.css"

export function JoinNode({ data }: NodeProps<JoinNodeData>) {
    const getJoinCond = () => {
        if(data.hashCond) {
            return data.hashCond;
        }
        else if(data.mergeCond) {
            return data.mergeCond;
        }
        else {
            return undefined;
        }
    }

    const joinCond = getJoinCond();
    console.log("Join Cond: ", joinCond);

    return (
        <>
            <Handle 
                type="target"
                position={Position.Left}
            />
            <div className="join node">
                <div className="node-type"> <h3>Join</h3> </div>
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
                    {joinCond && (
                        <div className="join-condition">
                            <p>Join Condition: </p>
                            <div>
                                <p><span>{joinCond}</span></p>
                            </div>
                        </div>)}
                </div>
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )

}
