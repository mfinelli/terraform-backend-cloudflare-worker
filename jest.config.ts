export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: 'ts-jest',
  testEnvironment: "miniflare",
  // testEnvironmentOptions: {
  //   bindings: { SENTRY_DSN: "" },
  // },
};
