import { type NodeProps, Handle, Position } from "reactflow";
import type { TableNodeData } from "../../types";
import "./tableNode.css"
import React from "react";

export function TableNode({ data }: NodeProps<TableNodeData>) {
    return (
        <>
            <div className="table node">
                <div className="node-type"> <h3>Table</h3> </div>
                <div className="contents">
                    <div className="name"> <h1>{data.name}</h1> </div>
                    <div className="attributes">
                        { data.attributes.map((a, i) => {
                            return (
                                <React.Fragment key={i}>
                                    <p>{a.name}</p>
                                    <p><strong>{a.type}</strong></p>
                                    <p className="keyTypes"><strong>{a.keyType}&nbsp;</strong></p>
                                </React.Fragment>
                            )
                        }) }
                    </div>
                    <div className="hline"> </div>
                    <p className="rowCount">row count: <span>{data.rowCount}</span></p>
                </div>
            </div>
            <Handle 
                type="source"
                position={Position.Right}
            />
        </>
    )
}

export function InnerTableNode({ data }: {data: TableNodeData}) {
    return (
        <>
        <div className="name"><h3>Table</h3></div>
        <div className="attributes">
            { data.attributes.map((a, i) => {
                return (
                    <React.Fragment key={i}>
                        <p>{a.name}</p>
                        <p><strong>{a.type}</strong></p>
                        <p className="keyTypes"><strong>{a.keyType}&nbsp;</strong></p>
                    </React.Fragment>
                )
            }) }
        </div>
        <div className="hline"> </div>
        <p className="rowCount">row count: <span>{data.rowCount}</span></p>
        </>
    )
}

export function InnerTableNode2({ data }: { data: string[] | undefined }) {
    if (data) {
        return (
            <>
                <div className="name"><h3>Output</h3></div>
                <div className="attributes single-col">
                    {data.map((col, i) => {
                        return (
                            <p key={i}>{col}</p>
                        )
                    })}
                </div>
            </>
        )
    } else return (<></>);
}
