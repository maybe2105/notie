import { WebSocketServer } from "ws";
import WebSocketJSONStream from "@teamwork/websocket-json-stream";

// Initialize the ShareDB WebSocket server
const initShareDBServer = (backend, pool) => {
  const shareDBServer = new WebSocketServer({
    noServer: true,
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
        console.log(
          `ShareDB doc ${noteId} does not exist. Fetching from DB...`
        );
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
            // Create a default empty document if not found in DB
            doc.create(
              {
                content: "",
                username: "Unknown",
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
    });

    webSocket.on("error", (error) => {
      console.error(`ShareDB WebSocket error for note ${noteId}:`, error);
    });
  });

  return shareDBServer;
};

export default initShareDBServer;
