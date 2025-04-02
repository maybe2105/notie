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
const poolOptions = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

const pool = new pg.Pool(poolOptions);

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
    // Insert into the regular notes table first
    const result = await pool.query(
      "INSERT INTO notes (username, content, updated_by) VALUES ($1, $2, $1) RETURNING *",
      [username, content]
    );
    const newNote = result.rows[0];

    // Send response directly after DB insert
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error in POST /notes:", error);
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
  noServer: true,
});

// Initialize ShareDB without the Postgres adapter
const backend = new ShareDB();

// Handle WebSocket upgrades
server.on("upgrade", (request, socket, head) => {
  // Check the path for the note ID
  const pathname = new URL(request.url, `http://${request.headers.host}`)
    .pathname;
  const match = pathname.match(/^\/notes\/([a-zA-Z0-9_-]+)$/);

  if (match) {
    webSocketServer.handleUpgrade(request, socket, head, (ws) => {
      webSocketServer.emit("connection", ws, request);
    });
  } else {
    // Handle other WebSocket connections or reject
    console.log("Rejecting WebSocket connection for path:", pathname);
    socket.destroy();
  }
});

webSocketServer.on("connection", (webSocket, req) => {
  // Create a stream for the WebSocket connection
  const stream = new WebSocketJSONStream(webSocket);
  // Listen for messages from the client and pass them to ShareDB
  backend.listen(stream);

  // Optional: You can handle disconnection or errors here
  webSocket.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup if needed
  });

  webSocket.on("error", (error) => {
    console.error("WebSocket error:", error);
    // Handle errors
  });

  console.log("WebSocket connection established for", req.url);
});

server.listen(PORT, () => {
  console.log(`Server running with express on port ${PORT}`);
});
