import { Pool, PoolClient } from "pg";
import { Attribute, NodeInfo, TableNodeInfo } from "./types/nodeTypes";
import { spawn } from "child_process";
import fs from "fs";

export class Database {
  public pool: Pool;
  private current_database_name: string = "dvdrental";

  constructor() {
    this.pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "dvdrental",
      user: "postgres",
      password: "password",
    });

    this.testConnection().catch((err) =>
      console.error("Initial connection test failed: ", err),
    );
  }

  private async testConnection(): Promise<void> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      console.log(
        `Successfully connected to database: ${this.current_database_name}`,
      );
    } catch (err) {
      console.error("Database connection failed:", (err as Error).message);
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseErr) {
          console.warn("Could not release client (pool may be closed)");
        }
      }
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
      console.log(
        `[explainQuery]: Attempting a query on db: ${this.current_database_name}`,
      );
      const explain_query = `EXPLAIN (ANALYZE, VERBOSE, FORMAT JSON) ${query}`;
      const result = await this.pool.query(explain_query);

      const plan_wrapper = result.rows[0]["QUERY PLAN"][0];
      const actual_plan = plan_wrapper.Plan;

      console.log("Rows: ", actual_plan);
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
    let temp_pool: Pool | null = null;
    let admin_pool: Pool | null = null;
    const oldPool = this.pool; // Save reference to old pool

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
        temp_pool = new Pool({
          host: "localhost",
          port: 5432,
          database: "postgres",
          user: "postgres",
          password: "password",
        });

        // Terminate all connections to the database first
        await temp_pool.query(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = '${this.current_database_name}'
            AND pid <> pg_backend_pid()
        `);

        // Small delay to ensure connections are closed
        await new Promise((resolve) => setTimeout(resolve, 100));

        await temp_pool.query(
          `DROP DATABASE IF EXISTS "${this.current_database_name}"`,
        );
        await temp_pool.end();
        temp_pool = null;
      }

      // Create new database
      admin_pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "postgres",
        user: "postgres",
        password: "password",
      });

      // Terminate any existing connections to the target database
      await admin_pool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${database_name}'
          AND pid <> pg_backend_pid()
      `);

      // Small delay to ensure connections are closed
      await new Promise((resolve) => setTimeout(resolve, 100));

      await admin_pool.query(`DROP DATABASE IF EXISTS "${database_name}"`);
      await admin_pool.query(`CREATE DATABASE "${database_name}"`);
      await admin_pool.end();
      admin_pool = null;

      return new Promise((resolve, reject) => {
        // Copy file to container
        const dockerCp = spawn("docker", [
          "cp",
          file_path,
          `postgres-dev:/tmp/uploaded_backup.${isSQL ? "sql" : "tar"}`,
        ]);

        dockerCp.on("close", (code: number | null) => {
          if (code === 0) {
            let restoreProcess;

            if (isSQL) {
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

            restoreProcess.on("close", async (restoreCode: number | null) => {
              try {
                fs.unlinkSync(file_path);
                console.log("Cleaning up the uploaded file");

                if (restoreCode === 0) {
                  console.log("The restore was successful!");

                  // Close old pool BEFORE creating new one
                  try {
                    await oldPool.end();
                    console.log("Old pool closed successfully");
                  } catch (endErr) {
                    console.warn("Error closing old pool:", endErr);
                  }

                  // Create new pool for the restored database
                  this.pool = new Pool({
                    host: "localhost",
                    port: 5432,
                    database: database_name,
                    user: "postgres",
                    password: "password",
                  });
                  this.current_database_name = database_name;
                  await this.testConnection();

                  try {
                    await this.analyzeNamingConventions();
                    await this.convertAllNamesToLowercase();
                    resolve(
                      `Database replaced and connected to ${database_name} (names converted to lowercase)`,
                    );
                  } catch (conversionError) {
                    console.warn(
                      "Database loaded but name conversion failed:",
                      conversionError,
                    );
                    resolve(
                      `Database replaced and connected to ${database_name} (conversion failed - may need quotes)`,
                    );
                  }
                } else {
                  // Restore failed - revert to dvdrental
                  try {
                    await oldPool.end();
                  } catch (endErr) {
                    console.warn("Error closing old pool:", endErr);
                  }

                  this.pool = new Pool({
                    host: "localhost",
                    port: 5432,
                    database: "dvdrental",
                    user: "postgres",
                    password: "password",
                  });
                  this.current_database_name = "dvdrental";
                  await this.testConnection();

                  reject(
                    new Error(
                      `${isSQL ? "psql" : "pg_restore"} failed with exit code ${restoreCode}`,
                    ),
                  );
                }
              } catch (error) {
                // Error during post-restore - revert to dvdrental
                try {
                  await oldPool.end();
                } catch (endErr) {
                  console.warn("Error closing old pool:", endErr);
                }

                this.pool = new Pool({
                  host: "localhost",
                  port: 5432,
                  database: "dvdrental",
                  user: "postgres",
                  password: "password",
                });
                this.current_database_name = "dvdrental";
                await this.testConnection();

                reject(error);
              }
            });

            restoreProcess.on("error", async (error: Error) => {
              try {
                await oldPool.end();
              } catch (endErr) {
                console.warn("Error closing old pool:", endErr);
              }

              this.pool = new Pool({
                host: "localhost",
                port: 5432,
                database: "dvdrental",
                user: "postgres",
                password: "password",
              });
              this.current_database_name = "dvdrental";
              await this.testConnection();

              reject(new Error(`Restore process error: ${error.message}`));
            });
          } else {
            // Docker copy failed - revert to dvdrental
            oldPool
              .end()
              .catch((err) => console.warn("Error closing old pool:", err))
              .finally(() => {
                this.pool = new Pool({
                  host: "localhost",
                  port: 5432,
                  database: "dvdrental",
                  user: "postgres",
                  password: "password",
                });
                this.current_database_name = "dvdrental";
                this.testConnection()
                  .then(() =>
                    reject(
                      new Error(`Docker copy failed with exit code ${code}`),
                    ),
                  )
                  .catch(reject);
              });
          }
        });

        dockerCp.on("error", async (error: Error) => {
          try {
            await oldPool.end();
          } catch (endErr) {
            console.warn("Error closing old pool:", endErr);
          }

          this.pool = new Pool({
            host: "localhost",
            port: 5432,
            database: "dvdrental",
            user: "postgres",
            password: "password",
          });
          this.current_database_name = "dvdrental";
          await this.testConnection();

          reject(new Error(`Docker copy process error: ${error.message}`));
        });
      });
    } catch (error) {
      // Ensure pools are closed
      if (temp_pool) {
        try {
          await temp_pool.end();
        } catch (e) {
          console.warn("Error closing temp_pool:", e);
        }
      }
      if (admin_pool) {
        try {
          await admin_pool.end();
        } catch (e) {
          console.warn("Error closing admin_pool:", e);
        }
      }

      // Revert to dvdrental
      try {
        await oldPool.end();
      } catch (endErr) {
        console.warn("Error closing old pool:", endErr);
      }

      this.pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "dvdrental",
        user: "postgres",
        password: "password",
      });
      this.current_database_name = "dvdrental";
      await this.testConnection();

      throw new Error(
        `Database replacement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  async convertAllNamesToLowercase(): Promise<void> {
    try {
      console.log("Converting all table and column names to lowercase...");

      // Step 1: Convert all column names first (before renaming tables)
      await this.convertAllColumnNames();

      // Step 2: Convert all table names
      await this.convertAllTableNames();

      console.log("All table and column names converted to lowercase");
      console.log("You can now use queries without quotes!");
    } catch (error) {
      console.error("Error during name conversion:", error);
      throw error;
    }
  }

  async convertAllColumnNames(): Promise<void> {
    try {
      console.log("Converting column names (first letter to lowercase)...");

      const result = await this.pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND column_name != lower(substring(column_name, 1, 1)) || substring(column_name, 2)
      ORDER BY table_name, ordinal_position
    `);

      const tableColumns = new Map<string, any[]>();

      for (const row of result.rows) {
        const tableName = row.table_name;
        if (!tableColumns.has(tableName)) {
          tableColumns.set(tableName, []);
        }
        tableColumns.get(tableName)!.push(row);
      }

      for (const [tableName, columns] of tableColumns.entries()) {
        console.log(`  📋 Converting columns in table "${tableName}"`);

        for (const column of columns) {
          const oldName = column.column_name;
          console.log("Old Column name: ", oldName);
          // Lowercase first letter only, keep rest as-is
          const newName = oldName.charAt(0).toLowerCase() + oldName.slice(1);
          console.log("New Column name: ", newName);

          try {
            console.log(`    • "${oldName}" → "${newName}"`);
            await this.pool.query(
              `ALTER TABLE "${tableName}" RENAME COLUMN "${oldName}" TO "${newName}"`,
            );
          } catch (error) {
            console.warn(`     Could not rename column "${oldName}": ${error}`);
          }
        }
      }
    } catch (error) {
      console.error("Error converting column names:", error);
      throw error;
    }
  }

  async convertAllTableNames(): Promise<void> {
    try {
      console.log("Converting table names (first letter to lowercase)...");

      const result = await this.pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != lower(substring(table_name, 1, 1)) || substring(table_name, 2)
      ORDER BY table_name
    `);

      const tableMap = new Map<string, string>();

      console.log("  Step 1: Creating temporary table names...");
      for (const row of result.rows) {
        const oldName = row.table_name;
        console.log("Old Table name: ", oldName);
        const tempName = `temp_${oldName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        console.log(`    • "${oldName}" → "${tempName}" (temporary)`);
        await this.pool.query(
          `ALTER TABLE "${oldName}" RENAME TO "${tempName}"`,
        );
        // Lowercase first letter only, keep rest as-is
        const finalName = oldName.charAt(0).toLowerCase() + oldName.slice(1);
        console.log("Final Table name: ", finalName);
        tableMap.set(tempName, finalName);
      }

      console.log("  📦 Step 2: Setting final names...");
      for (const [tempName, finalName] of tableMap.entries()) {
        console.log(`    • "${tempName}" → "${finalName}" (final)`);
        await this.pool.query(
          `ALTER TABLE "${tempName}" RENAME TO "${finalName}"`,
        );
      }

      console.log(`✅ Converted ${tableMap.size} table names (first letter)`);
    } catch (error) {
      console.error("Error converting table names:", error);
      throw error;
    }
  }
  // Helper method to check what needs conversion (useful for debugging)
  async analyzeNamingConventions(): Promise<void> {
    try {
      // Check tables
      const tables = await this.pool.query(`
      SELECT 
        table_name,
        CASE WHEN table_name != lower(table_name) THEN 'NEEDS_CONVERSION' ELSE 'OK' END as status
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

      // Check columns
      const columns = await this.pool.query(`
      SELECT 
        table_name,
        column_name,
        CASE WHEN column_name != lower(column_name) THEN 'NEEDS_CONVERSION' ELSE 'OK' END as status
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name
    `);

      console.log("\n📊 NAMING ANALYSIS:");
      console.log(
        `Tables: ${tables.rows.filter((r) => r.status === "NEEDS_CONVERSION").length} need conversion`,
      );
      console.log(
        `Columns: ${columns.rows.filter((r) => r.status === "NEEDS_CONVERSION").length} need conversion`,
      );

      // Show examples
      const problemTables = tables.rows
        .filter((r) => r.status === "NEEDS_CONVERSION")
        .slice(0, 5);
      const problemColumns = columns.rows
        .filter((r) => r.status === "NEEDS_CONVERSION")
        .slice(0, 5);

      if (problemTables.length > 0) {
        console.log("\nTables needing conversion (showing first 5):");
        problemTables.forEach((t) => console.log(`  • "${t.table_name}"`));
      }

      if (problemColumns.length > 0) {
        console.log("\nColumns needing conversion (showing first 5):");
        problemColumns.forEach((c) =>
          console.log(`  • "${c.table_name}".${c.column_name}"`),
        );
      }
    } catch (error) {
      console.error("Error analyzing naming conventions:", error);
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
