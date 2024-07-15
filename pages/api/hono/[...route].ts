import { handle } from "@hono/node-server/vercel";

import { app } from "backend/honoApp";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handle(app);
