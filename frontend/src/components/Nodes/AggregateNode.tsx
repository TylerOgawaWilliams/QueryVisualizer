import type { AggregateNodeData } from "../../types";
import { Handle, Position } from "reactflow";
import "../Nodes/aggregateNode.css";
import { InnerTableNode2 } from "./TableNode";

export function AggregateNode({ data }: { data: AggregateNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className="aggregate node">
        <div className="node-type">
          {" "}
          <h3>Aggregate</h3>{" "}
        </div>
        <div className="contents">
          <div className="name">
            {" "}
            <h1>{data.name}</h1>{" "}
          </div>
          <div className="startup-cost">
            <p>Startup Cost: </p>
            <p>
              <span>{data.startUpCost}</span>
            </p>
          </div>
          <div className="hline-gray"></div>
          <div className="total-cost">
            <p>Total Cost: </p>
            <p>
              <span>{data.totalCost}</span>
            </p>
          </div>
          {data.filter && (
            <>
              <div className="hline-black"> </div>
              <div className="filter">
                <p>Filter: </p>
                <div>
                  <p>
                    <span>{data.filter}</span>
                  </p>
                </div>
              </div>
            </>
          )}
          <InnerTableNode2 data={data.columns} />
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

