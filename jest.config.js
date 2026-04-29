const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFiles: ["<rootDir>/tests/polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss)$": "<rootDir>/tests/style-mock.ts",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    "node_modules/(?!(?:msw|@mswjs|@bundled-es-modules|rettime|outvariant|until-async|strict-event-emitter|@open-draft|headers-polyfill)/)",
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return config;
};
