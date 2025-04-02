import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import ShareDB from "sharedb";
import { WebSocketServer } from "ws";
import http from "node:http";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration
const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());

// Routes
app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/notes", async (req, res) => {
  const { username, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO notes (username, content, updated_by) VALUES ($1, $2, $1) RETURNING *",
      [username, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);
  res.json(result.rows[0]);
});

app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { username, content, updatedBy } = req.body;

  if (!username || !content || !updatedBy) {
    return res
      .status(400)
      .json({ error: "Username, content, and updatedBy are required" });
  }

  const sanitizedUsername = username.replace(/[^a-zA-Z0-9\s]/g, "");
  // Don't sanitize content to preserve formatting
  const sanitizedUpdatedBy = updatedBy.replace(/[^a-zA-Z0-9\s]/g, "");

  const result = await pool.query(
    "UPDATE notes SET username = $1, content = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
    [sanitizedUsername, content, sanitizedUpdatedBy, id]
  );
  res.json(result.rows[0]);
});

const server = http.createServer(app);

const webSocketServer = new WebSocketServer({
  server,
});

const backend = new ShareDB();
webSocketServer.on("connection", (webSocket) => {
  // identify the client by username
  const username = webSocket.username;
  const stream = new WebSocketJSONStream(webSocket);
  backend.listen(stream);
});

server.listen(PORT, () => {
  console.log(`Server running with express on port ${PORT}`);
});
