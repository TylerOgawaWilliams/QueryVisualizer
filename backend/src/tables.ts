import { Database } from "./database";
import { Attribute, NodeInfo, TableNodeInfo } from "./nodeTypes";

export class Tables {
    private db : Database;
    private node_info: NodeInfo[];
    private primary_keys: {[key: string]: string[] } ; // maps tables to their primary key attributes
    private foreign_keys: {[key: string]: string[] }; // maps tables to their foreign key attributes
    private keyTypes: {[key: string]: { [key: string]: string } }; // maps tables with their attributes to attribute types
    private attributes: {[key: string]: Attribute[] }; // maps tables to their attributes
    private tableNodes: TableNodeInfo[]; 

    constructor(node_info: NodeInfo[]) {
        this.db = new Database();
        this.node_info = node_info;
        this.primary_keys = {};
        this.foreign_keys = {};
        this.keyTypes = {};
        this.attributes = {};
        this.tableNodes = [];
    }

    public async init() {
        await this.setPrimaryKeys();
        await this.setForeignKeys();
        await this.setAttributes();
    }

    public getTableNodes() { return this.tableNodes; }

    public isPrimaryKey(table: string, attribute: string) : boolean {
        return this.primary_keys[table]?.includes(attribute) ?? false;
    }

    public isForeignKey(table: string, attribute: string) : boolean {
        return this.foreign_keys[table]?.includes(attribute) ?? false;
    }

    public getKeyType(table: string, attribute: string) : string | undefined {
        return this.keyTypes[table] ? this.keyTypes[table][attribute] : undefined;
    }

    private async setPrimaryKeys() {
        const pkQuery = `
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_name = $1
        `;

        for (const n of this.node_info) {
            if (n.nodeType.includes("Scan") && n.relationName) {
                const pkResult = await this.db.pool.query(pkQuery, [n.relationName]);
                const pks = pkResult.rows.map(r => r.column_name);
                this.primary_keys[n.relationName] = pks;
            }
        }
    }

    private async setForeignKeys() {
        const fkQuery = `
          SELECT
            kcu.column_name AS fk_column,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = $1
        `;

        for (const n of this.node_info) {
            if (n.nodeType.includes("Scan") && n.relationName) {
                const fkResult = await this.db.pool.query(fkQuery, [n.relationName]);
                const fks = fkResult.rows.map(r => r.fk_column);
                console.log("Foreign Keys: ", fks);
                this.foreign_keys[n.relationName] = fks;
            }
        }
    }

    private async setAttributes() {
        const column_query = `SELECT column_name, udt_name
                              FROM information_schema.columns
                              WHERE table_name = $1
                              ORDER BY ordinal_position`;

        for (const n of this.node_info) {
            if (n.nodeType.includes("Scan") && n.relationName) {
                const columnResult = await this.db.pool.query(column_query, [n.relationName]);
                const attributes = columnResult.rows.map((r) => {
                    const isPK = this.isPrimaryKey(n.relationName!, r.column_name)
                    const isFK = this.isForeignKey(n.relationName!, r.column_name)
                    const keyType = isPK && isFK ? "PK, FK" : isPK ? "PK" : isFK ? "FK" : undefined;
                    
                    const attribute : Attribute = {
                        name: r.column_name, 
                        type: r.udt_name,
                        keyType: keyType
                    }
                    console.log("Attribute: ", attribute);
                    console.log("Relation name: ", n.relationName);
                    if(!this.keyTypes[n.relationName!]) {
                        this.keyTypes[n.relationName!] = {};
                    }
                    
                    this.keyTypes[n.relationName!][r.column_name] = r.udt_name;
                    return attribute;
                });

                this.attributes[n.relationName] = attributes;

                // Create the table node
                const node : TableNodeInfo = {
                    id: `table-${n.id}`,
                    targetNode: n.id,
                    relationName: n.relationName,
                    columns: attributes,
                    depth: n.depth - 1,
                    rowCount: n.planRows
                }

                this.tableNodes.push(node);
            }
        }
    }
}
