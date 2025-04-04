import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "node:http";
import { URL } from "url";
import path from "path";

const __dirname = path.resolve();
dotenv.config();

// Import modules
import pool from "./config/db.js";
import notesRouter from "./routes/notes.js";
import initShareDB from "./middleware/sharedb.js";
import initShareDBServer from "./websockets/sharedb.js";
import initPresenceServer from "./websockets/presence.js";
import { initBatchProcessing } from "./middleware/batchUpdates.js";

// App configuration
const app = express();
const PORT = process.env.PORT || 3001;
// log request url
app.use((req, res, next) => {
  console.log("request url", req.url);
  next();
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.static(path.join(__dirname, "build")));

app.use(express.json());

// API routes

// frontend /api/notes
app.use("/api/notes", notesRouter);

// return frontend index.html
app.use("/*", (req, res) => {
  // production build
  if (process.env.NODE_ENV === "production") {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  } else {
    res.sendFile(path.join(__dirname, "..", "client", "public", "index.html"));
  }
});

// Create HTTP server
const server = http.createServer(app);

// Database config for ShareDB
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

// Initialize ShareDB backend
const backend = initShareDB(dbConfig);

// Initialize batch processing
initBatchProcessing();

// Initialize WebSocket servers
const shareDBServer = initShareDBServer(backend, pool);
const { presenceServer } = initPresenceServer();

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

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
