import { useRef, useState } from "react";

import { useEffect } from "react";
export const usePresence = (id: string, username: string | null) => {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const presenceSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!username) return;

    // Use relative URL instead of hardcoded localhost
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const baseUrl = `${protocol}//${window.location.host}/presence/${id}`;

    const url = new URL(baseUrl);
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
