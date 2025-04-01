import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

const app = new Hono();
const PORT = process.env.PORT || 3001;

app.use(cors());

console.log(`Server running with honor on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
