module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {                          // fix: was moduleNameMapping (typo)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  reporters: [
    'default',
    [
      'allure-jest',
      {
        resultsDir: 'allure-results',          // must match results-directory in CI
        testMode: true,
        suiteTitle: false,
        links: {
          issue: {
            nameTemplate: 'Issue #%s',
            urlTemplate: 'https://github.com/YOUR_ORG/YOUR_REPO/issues/%s',
          },
        },
      },
    ],
  ],
};