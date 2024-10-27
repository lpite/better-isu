import { defineConfig } from "orval";

export default defineConfig({
  capybara: {
    output: {
      mode: "tags-split",
      target: "orval/capybara.ts",
      schemas: "orval/model",
      client: "swr",
      mock: false,
      baseUrl: "/api/hono/openapi",
      override: {
        mutator: {
          path: "orval/custom-client.ts",
        },
      },
    },
    input: {
      target: "http://localhost:3001/api/hono/openapi/doc",
    },
  },
});
