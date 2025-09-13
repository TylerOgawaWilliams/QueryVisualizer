import express, { Request, Response } from "express";
import cors from "cors";
import { Pool, PoolClient } from "pg";
import { Database } from "./database";
import { PlanParser } from "./planParser";
import {
  ExplainRequest,
  ExplainResponse,
  SampleQuery,
  ExecuteResponse,
} from "./types";

const app = express();
app.use(cors());
app.use(express.json());

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
      const rawPlan = await db.explainQuery(query);
      const parsedPlan = PlanParser.parsePlan(rawPlan);

      res.json({
        success: true,
        plan: parsedPlan,
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
const PORT: number = 3001;

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await db.close();
  process.exit(0);
});
