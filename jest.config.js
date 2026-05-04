module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'allure-jest/node',        // ← not a reporter, it's an environment
  testEnvironmentOptions: {
    resultsDir: './allure-results',            // ← must match CI workflow results-directory
  },
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
    'default',                                 // only default — allure is handled by the environment
  ],
};