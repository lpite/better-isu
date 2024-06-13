module.exports = {
  capybara: {
    output: {
      mode: 'tags-split',
      target: 'openapi/capybara.ts',
      schemas: 'openapi/model',
      client: 'swr',
      mock: false,
      baseUrl: '/api/',
      override: {
        mutator: {
          path: './custom.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: 'http://localhost:3000/api/doc',
    },
  },
};