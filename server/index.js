import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import ShareDB from "sharedb";
import { WebSocketServer } from "ws";
import http from "node:http";
import SharedbPostgres from "sharedb-postgres";
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
const sharedbPostgres = SharedbPostgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const backend = new ShareDB({ db: sharedbPostgres });

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
shareDBServer.on("connection", async (webSocket, req) => {
  const stream = new WebSocketJSONStream(webSocket);

  // Extract noteId from the URL
  const urlMatch = req.url.match(/^\/notes\/([a-zA-Z0-9_-]+)$/);
  if (!urlMatch) {
    console.error("Invalid ShareDB connection URL:", req.url);
    webSocket.close(1011, "Invalid URL format");
    return;
  }
  const noteId = urlMatch[1];

  console.log(`ShareDB connection attempt for note: ${noteId}`);

  // Fetch the document and check if it exists
  const connection = backend.connect();
  const doc = connection.get("notes", noteId);

  doc.fetch(async (err) => {
    if (err) {
      console.error(`Error fetching ShareDB doc ${noteId}:`, err);
      // Continue listening even if fetch fails, ShareDB might recover
      backend.listen(stream);
      return;
    }

    // If the document doesn't exist, create it from the database
    if (!doc.type) {
      console.log(`ShareDB doc ${noteId} does not exist. Fetching from DB...`);
      try {
        const dbResult = await pool.query(
          "SELECT content, username, updated_by, updated_at FROM notes WHERE id = $1",
          [noteId]
        );

        if (dbResult.rows.length > 0) {
          const noteData = dbResult.rows[0];
          console.log(`Found note ${noteId} in DB. Creating ShareDB doc.`);
          doc.create(
            {
              content: noteData.content,
              username: noteData.username,
              updated_by: noteData.updated_by,
              updated_at: noteData.updated_at.toISOString(),
            },
            (createErr) => {
              if (createErr) {
                console.error(
                  `Error creating ShareDB doc ${noteId}:`,
                  createErr
                );
              } else {
                console.log(`ShareDB doc ${noteId} created successfully.`);
              }
              // Listen regardless of creation success/failure after attempt
              backend.listen(stream);
            }
          );
        } else {
          console.log(
            `Note ${noteId} not found in DB. Creating empty ShareDB doc.`
          );
          // Optional: Create a default empty document if not found in DB
          doc.create(
            {
              content: "",
              username: "Unknown", // Or derive from request if possible
              updated_by: "System",
              updated_at: new Date().toISOString(),
            },
            (createErr) => {
              if (createErr) {
                console.error(
                  `Error creating empty ShareDB doc ${noteId}:`,
                  createErr
                );
              } else {
                console.log(`Empty ShareDB doc ${noteId} created.`);
              }
              backend.listen(stream);
            }
          );
        }
      } catch (dbErr) {
        console.error(`Database error fetching note ${noteId}:`, dbErr);
        // Listen even if DB query fails
        backend.listen(stream);
      }
    } else {
      // Document already exists, just listen
      console.log(
        `ShareDB doc ${noteId} already exists. Listening for changes.`
      );
      backend.listen(stream);
    }
  });

  webSocket.on("close", () => {
    console.log(`ShareDB WebSocket connection closed for note: ${noteId}`);
    // Clean up the connection if needed, connection.close() might be relevant
    // depending on how backend.connect() handles resources.
    // stream.destroy(); // Might be necessary if WebSocketJSONStream holds resources
  });

  webSocket.on("error", (error) => {
    console.error(`ShareDB WebSocket error for note ${noteId}:`, error);
  });

  // Moved backend.listen inside doc.fetch callback
  // console.log("ShareDB WebSocket connection established for", req.url);
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
