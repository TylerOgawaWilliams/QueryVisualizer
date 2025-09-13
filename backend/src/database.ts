import { Pool, PoolClient } from "pg";
import { spawn } from "child_process";
import fs from "fs";

export class Database {
  private pool: Pool;
  private current_database_name: string = "dvdrental";

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

  getCurrentDatabase(): string {
    return this.current_database_name;
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
      const explain_query = `EXPLAIN (ANALYZE, VERBOSE, FORMAT JSON) ${query}`;
      const result = await this.pool.query(explain_query);

      const plan_wrapper = result.rows[0]["QUERY PLAN"][0];
      const actual_plan = plan_wrapper.Plan;

      console.log("Extracted plan:", JSON.stringify(actual_plan, null, 2));

      return actual_plan;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown explain error",
      );
    }
  }

  async replaceDatabase(
    file_path: string,
    database_name: string,
  ): Promise<string> {
    try {
      const isSQL = file_path.endsWith(".sql");
      const isTAR = file_path.endsWith(".tar");

      if (!isSQL && !isTAR) {
        throw new Error(
          "Unsupported file type. Only .sql and .tar files are supported.",
        );
      }

      // Drop current database if not dvdrental
      if (this.current_database_name !== "dvdrental") {
        await this.pool.end();
        const temp_pool = new Pool({
          host: "localhost",
          port: 5432,
          database: "postgres",
          user: "postgres",
          password: "password",
        });

        await temp_pool.query(
          `DROP DATABASE IF EXISTS "${this.current_database_name}"`,
        );
        await temp_pool.end();
      }

      // Create new database
      const admin_pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "postgres",
        user: "postgres",
        password: "password",
      });

      await admin_pool.query(`DROP DATABASE IF EXISTS "${database_name}"`);
      await admin_pool.query(`CREATE DATABASE "${database_name}"`);
      await admin_pool.end();

      console.log(`Database ${database_name} created!`);

      return new Promise((resolve, reject) => {
        // Copy file to container
        const dockerCp = spawn("docker", [
          "cp",
          file_path,
          `postgres-dev:/tmp/uploaded_backup.${isSQL ? "sql" : "tar"}`,
        ]);

        console.log(`Copying ${isSQL ? "SQL" : "TAR"} file to container`);

        dockerCp.on("close", (code: number | null) => {
          if (code === 0) {
            let restoreProcess;

            if (isSQL) {
              // Use psql for SQL files
              restoreProcess = spawn("docker", [
                "exec",
                "-i",
                "postgres-dev",
                "psql",
                "-U",
                "postgres",
                "-d",
                database_name,
                "-f",
                "/tmp/uploaded_backup.sql",
              ]);
            } else {
              // Use pg_restore for TAR files
              restoreProcess = spawn("docker", [
                "exec",
                "-i",
                "postgres-dev",
                "pg_restore",
                "-U",
                "postgres",
                "-d",
                database_name,
                "-v",
                "/tmp/uploaded_backup.tar",
              ]);
            }

            console.log(`Spawned ${isSQL ? "psql" : "pg_restore"} process`);

            restoreProcess.on("close", async (restoreCode: number | null) => {
              try {
                fs.unlinkSync(file_path); // Clean up file
                console.log("Cleaning up the uploaded file");
                console.log(`restoreCode: ${restoreCode}`);

                if (restoreCode === 0) {
                  console.log("The restore was successful!");
                  this.pool = new Pool({
                    host: "localhost",
                    port: 5432,
                    database: database_name,
                    user: "postgres",
                    password: "password",
                  });

                  this.current_database_name = database_name;
                  await this.testConnection();
                  resolve(
                    `Database replaced and connected to ${database_name}`,
                  );
                } else {
                  reject(
                    new Error(
                      `${isSQL ? "psql" : "pg_restore"} failed with exit code ${restoreCode}`,
                    ),
                  );
                }
              } catch (error) {
                reject(error);
              }
            });

            // Handle restore process errors
            restoreProcess.on("error", (error: Error) => {
              reject(new Error(`Restore process error: ${error.message}`));
            });
          } else {
            reject(new Error(`Docker copy failed with exit code ${code}`));
          }
        });

        dockerCp.on("error", (error: Error) => {
          reject(new Error(`Docker copy process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(
        `Database replacement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
