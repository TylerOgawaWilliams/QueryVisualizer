import { Pool, PoolClient } from "pg";

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "dvdrental",
      user: "postgres",
      password: "password",
    });

    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      const client: PoolClient = await this.pool.connect();
      console.log("Connected to PostgreSQL database");
      client.release();
    } catch (err) {
      console.error("Database connection failed:", (err as Error).message);
    }
  }

  async executeQuery(query: string): Promise<any> {
    try {
      const result = await this.pool.query(query);
      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map((field) => ({
          name: field.name,
          dataType: field.dataTypeID,
        })),
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown database error",
      );
    }
  }

  async explainQuery(query: string): Promise<any> {
    try {
      const explain_query = `EXPLAIN (ANALYZE, FORMAT JSON) ${query}`;
      const result = await this.pool.query(explain_query);
      return result.rows[0]["QUERY PLAN"][0];
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown explain error",
      );
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
