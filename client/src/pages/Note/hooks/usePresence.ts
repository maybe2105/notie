import { useRef, useState } from "react";

import { useEffect } from "react";

export const usePresence = (id: string, username: string | null) => {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const presenceSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!username) return;

    const url = new URL(`ws://localhost:3001/presence/${id}`);
    url.searchParams.append("username", username);

    const presenceSocket = new WebSocket(url.toString());
    presenceSocketRef.current = presenceSocket;

    presenceSocket.onopen = () => {
      console.log("Presence WebSocket connection opened");
    };

    presenceSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "presence" && isMounted) {
          setActiveUsers(data.users);
        }
      } catch (err) {
        console.error("Error parsing presence message:", err);
      }
    };

    presenceSocket.onerror = (event) => {
      console.error("Presence WebSocket error:", event);
    };

    return () => {
      isMounted = false;
      if (presenceSocketRef.current) {
        presenceSocketRef.current.close();
        presenceSocketRef.current = null;
      }
    };
  }, [id, username]);

  return { activeUsers };
};
