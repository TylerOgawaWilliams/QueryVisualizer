import express, { Request, Response } from "express";
import cors from "cors";
import { Pool, PoolClient } from "pg";

interface SampleQuery {
  name: string;
  query: string;
}

interface ExplainRequest {
  query: string;
}

const app = express();
app.use(cors());
app.use(express.json());

// Postgres connection
const pool: Pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "dvdrental",
  user: "postgres",
  password: "password",
});

pool
  .connect()
  .then((client: PoolClient) => {
    console.log("Connected to the Postgres DB!");
    client.release();
  })
  .catch((err: Error) => {
    console.error("Database connection is so so cooked: ", err.message);
  });

app.get("/api/test", (req: Request, res: Response) => {
  console.log("Test endpoint hit!");
  res.json({ message: "Backend working!" });
});

app.get("/api/test-queries", (req: Request, res: Response<SampleQuery[]>) => {
  const test_queries: SampleQuery[] = [
    {
      name: "Simple Actor Query",
      query: "SELECT * FROM ACTOR LIMIT 10;",
    },
  ];

  res.json(test_queries);
  console.log("Success!");
});

app.post(
  "/api/query",
  async (req: Request<{}, any, ExplainRequest>, res: Response) => {
    const { query }: ExplainRequest = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "There is no query!",
      });
    }

    try {
      console.log("Executing the query:", query);
      const result = await pool.query(query);

      console.log(`Query returned ${result.rows.length} rows`);
      res.json({
        success: true,
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map((field) => ({
          name: field.name,
          dataType: field.dataTypeID,
        })),
      });
    } catch (error) {
      console.error("There was a problem executing the query: ", error);
      res.status(500).json({
        success: false,
        erorr: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

const PORT: number = 3001;

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
