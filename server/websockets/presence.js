import { WebSocketServer } from "ws";
import activeUsersManager from "../utils/activeUsers.js";

// Initialize the presence WebSocket server
const initPresenceServer = () => {
  const presenceServer = new WebSocketServer({
    noServer: true,
  });

  // Broadcast active users for a specific note
  const broadcastActiveUsers = (noteId) => {
    const usersList = activeUsersManager.getUsersInNote(noteId);

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

  // Handle presence connections
  presenceServer.on("connection", (webSocket, req) => {
    const { noteId, username } = webSocket;

    if (noteId && username) {
      // Add user to active users for this note
      activeUsersManager.addUser(noteId, username);

      // Broadcast updated list of active users
      broadcastActiveUsers(noteId);

      console.log(`User ${username} joined note ${noteId}`);
    }

    // Handle client messages
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

      if (noteId && username) {
        const isNoteEmpty = activeUsersManager.removeUser(noteId, username);

        if (!isNoteEmpty) {
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

  return {
    presenceServer,
    broadcastActiveUsers,
  };
};

export default initPresenceServer;
