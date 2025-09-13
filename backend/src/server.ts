import express, { Request, Response } from "express";
import cors from "cors";
import { Pool, PoolClient } from "pg";
import { Database } from "./database";
import { PlanParser, NodeInfo } from "./planParser";
import { upload } from "./upload";
import {
  ExplainRequest,
  ExplainResponse,
  SampleQuery,
  ExecuteResponse,
  DatabaseUploadResponse,
  DatabaseUploadRequest,
  CurrentDatabaseResponse,
} from "./types";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new Database();

app.get("/api/test", (req: Request, res: Response) => {
  console.log("Test endpoint hit!");
  res.json({ message: "Backend working!" });
});

app.get("/api/test-query", (req: Request, res: Response<SampleQuery[]>) => {
  const test_query: SampleQuery[] = [
    {
      name: "Simple Actor Query",
      query: "SELECT * FROM ACTOR LIMIT 10;",
    },
  ];

  res.json(test_query);
  console.log("Success!");
});

app.post(
  "/api/execute",
  async (
    req: Request<{}, ExecuteResponse, ExplainRequest>,
    res: Response<ExecuteResponse>,
  ) => {
    const { query }: ExplainRequest = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    try {
      console.log("Executing query:", query);
      const result = await db.executeQuery(query);
      res.json(result);
    } catch (error) {
      console.error("Query execution error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

app.post(
  "/api/explain",
  async (
    req: Request<{}, ExplainResponse, ExplainRequest>,
    res: Response<ExplainResponse>,
  ) => {
    const { query }: ExplainRequest = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    try {
      console.log("Analyzing query:", query);
      const raw_plan = await db.explainQuery(query);
      console.log(
        "Raw Query Plan recieved: ",
        JSON.stringify(raw_plan, null, 2),
      );
      const parsed_plan = PlanParser.parsePlan(raw_plan);
      const flat_nodes = PlanParser.flattenTree(parsed_plan);
      const links = PlanParser.getTreeLinks(parsed_plan);
      const stats = PlanParser.getNodeStats(flat_nodes);
      const execution_order = PlanParser.getExecutionOrder(parsed_plan);
      const bottlenecks = PlanParser.findBottlenecks(flat_nodes);

      res.json({
        success: true,
        plan: {
          tree: parsed_plan,
          nodes: flat_nodes,
          links: links,
          stats: stats,
          executionOrder: execution_order,
          bottlenecks: bottlenecks,
          originalQuery: query,
        },
      });
    } catch (error) {
      console.error("Query analysis error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

app.post(
  "/api/upload-database",
  upload.single("database"),
  async (
    req: Request<{}, DatabaseUploadResponse, DatabaseUploadRequest>,
    res: Response<DatabaseUploadResponse>,
  ) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No db file uploaded",
      });
    }

    const { databaseName } = req.body;

    try {
      const result = await db.replaceDatabase(req.file.path, databaseName);
      res.json({
        success: true,
        message: result,
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error("Database Upload error: ", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  },
);

app.get(
  "/api/current-database",
  (req: Request, res: Response<CurrentDatabaseResponse>) => {
    res.json({
      success: true,
      currentDatabase: db.getCurrentDatabase(),
    });
  },
);

const PORT: number = 3001;

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await db.close();
  process.exit(0);
});
