module.exports = {
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
      target: "http://localhost:3000/api/hono/openapi/doc",
    },
  },
};
