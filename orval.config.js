module.exports = {
  capybara: {
    output: {
      mode: 'tags-split',
      target: 'orval/capybara.ts',
      schemas: 'orval/model',
      client: 'swr',
      mock: false,
      baseUrl: '/api/hono',
      override: {
        mutator: {
          path: 'orval/custom-client.ts',
          // name: 'customClient',
        },
      },
    },
    input: {
      target: 'http://localhost:3000/api/hono/doc',
    },
  },
};