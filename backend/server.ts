import "dotenv/config";

import { serve } from "@hono/node-server";

import { app } from "./honoApp";

serve({ port: 3001, fetch: app.fetch });
