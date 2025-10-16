
import { type NodeProps, Handle, Position } from "reactflow";
import type { TableNodeData } from "../../types";
import "./tableNode.css"

export function TableNode({ data }: NodeProps<TableNodeData>) {
    return (
        <>
            <div className="table node">
                <div className="node-type"> <h3>Table</h3> </div>
                <div className="contents">
                    <div className="name"> <h1>{data.name}</h1> </div>
                    <div className="attributes">
                        <div className="names">
                            { data.attributes.map((a, i) => {
                                return (
                                    <div key={i}>
                                        <p>{a.name}</p>
                                        { i != data.attributes.length - 1 && (
                                            <div className="hline"> </div>
                                        )}
                                    </div>
                                )
                            }) }
                        </div>
                        <div className="types">
                            { data.attributes.map((a, i) => {
                                return (
                                    <div key={i + data.attributes.length}>
                                        <p><strong>{a.type}</strong></p>
                                        { i != data.attributes.length - 1 && (
                                            <div className="hline"> </div>
                                        )}
                                    </div>
                                )
                            }) }
                        </div>
                        <div className="keyTypes">
                            { data.attributes.map((a, i) => {
                                return (
                                    <div key={i + (2 * data.attributes.length)}>
                                        <p><strong>{a.keyType}&nbsp;</strong></p>
                                        { i != data.attributes.length - 1 && (
                                            <div className="hline"> </div>
                                        )}
                                    </div>
                                )
                            }) }
                        </div>
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
            <div className="names">
                { data.attributes.map((a, i) => {
                    return (
                        <div key={i}>
                            <p>{a.name}</p>
                            { i != data.attributes.length - 1 && (
                                <div className="hline"> </div>
                            )}
                        </div>
                    )
                }) }
            </div>
            <div className="types">
                { data.attributes.map((a, i) => {
                    return (
                        <div key={i + data.attributes.length}>
                            <p><strong>{a.type}</strong></p>
                            { i != data.attributes.length - 1 && (
                                <div className="hline"> </div>
                            )}
                        </div>
                    )
                }) }
            </div>
            <div className="keyTypes">
                { data.attributes.map((a, i) => {
                    return (
                        <div key={i + (2 * data.attributes.length)}>
                            <p><strong>{a.keyType}&nbsp;</strong></p>
                            { i != data.attributes.length - 1 && (
                                <div className="hline"> </div>
                            )}
                        </div>
                    )
                }) }
            </div>
        </div>
        <div className="hline"> </div>
        <p className="rowCount">row count: <span>{data.rowCount}</span></p>
        </>
    )
}