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

// Track active users by note ID
const activeUsers = new Map();

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

// Initialize ShareDB WebSocket server
const shareDBServer = new WebSocketServer({
  noServer: true,
});

// Initialize separate presence WebSocket server
const presenceServer = new WebSocketServer({
  noServer: true,
});

// Initialize ShareDB without the Postgres adapter
const backend = new ShareDB();

// Broadcast active users for a specific note
const broadcastActiveUsers = (noteId) => {
  const usersInNote = activeUsers.get(noteId) || new Set();
  const usersList = Array.from(usersInNote);

  presenceServer.clients.forEach((client) => {
    if (client.noteId === noteId && client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: "presence",
          users: usersList,
        })
      );
    }
  });
};

// Handle WebSocket upgrades - route to the appropriate WebSocket server
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  // Route for ShareDB (notes editing)
  if (pathname.startsWith("/notes/")) {
    const match = pathname.match(/^\/notes\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      shareDBServer.handleUpgrade(request, socket, head, (ws) => {
        shareDBServer.emit("connection", ws, request);
      });
    } else {
      console.log("Rejecting WebSocket connection for path:", pathname);
      socket.destroy();
    }
  }
  // Route for presence tracking
  else if (pathname.startsWith("/presence/")) {
    const match = pathname.match(/^\/presence\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      presenceServer.handleUpgrade(request, socket, head, (ws) => {
        const noteId = match[1];
        const username = url.searchParams.get("username");

        // Store noteId and username on the WebSocket for later reference
        ws.noteId = noteId;
        ws.username = username;

        presenceServer.emit("connection", ws, request);
      });
    } else {
      console.log("Rejecting WebSocket connection for path:", pathname);
      socket.destroy();
    }
  } else {
    console.log("Unknown WebSocket path:", pathname);
    socket.destroy();
  }
});

// Handle ShareDB connections
shareDBServer.on("connection", (webSocket, req) => {
  // Create a stream for ShareDB
  const stream = new WebSocketJSONStream(webSocket);
  backend.listen(stream);

  webSocket.on("close", () => {
    console.log("ShareDB WebSocket connection closed");
  });

  webSocket.on("error", (error) => {
    console.error("ShareDB WebSocket error:", error);
  });

  console.log("ShareDB WebSocket connection established for", req.url);
});

// Handle presence connections
presenceServer.on("connection", (webSocket, req) => {
  const { noteId, username } = webSocket;

  if (noteId && username) {
    // Add user to active users for this note
    if (!activeUsers.has(noteId)) {
      activeUsers.set(noteId, new Set());
    }
    activeUsers.get(noteId).add(username);

    // Broadcast updated list of active users
    broadcastActiveUsers(noteId);

    console.log(`User ${username} joined note ${noteId}`);
  }

  // Handle client messages (not needed for now, but could be used for custom events)
  webSocket.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received presence message:", data);
    } catch (err) {
      console.error("Invalid JSON in presence message");
    }
  });

  // Handle disconnection
  webSocket.on("close", () => {
    const { noteId, username } = webSocket;

    if (noteId && username && activeUsers.has(noteId)) {
      activeUsers.get(noteId).delete(username);

      if (activeUsers.get(noteId).size === 0) {
        activeUsers.delete(noteId);
      } else {
        broadcastActiveUsers(noteId);
      }

      console.log(`User ${username} left note ${noteId}`);
    }

    console.log("Presence WebSocket connection closed");
  });

  webSocket.on("error", (error) => {
    console.error("Presence WebSocket error:", error);
  });

  console.log(
    `Presence WebSocket connection established for ${req.url} by ${
      username || "anonymous"
    }`
  );
});

server.listen(PORT, () => {
  console.log(`Server running with express on port ${PORT}`);
});
