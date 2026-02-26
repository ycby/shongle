import { createDefaultEsmPreset } from "ts-jest";

const preset = createDefaultEsmPreset();

const config = {
  ...preset,
  testEnvironment: 'node',
  verbose: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^#root/(.*)\\.js$': '<rootDir>/$1',
    '^#root/(.*)$': '<rootDir>/$1'
  },
  transformIgnorePatterns: [
     'node_modules/(?!(money-type)/)'
  ]
}
// const config = {
//   ...presetConfig,
//   testEnvironment: "node",
//   globals: {
//     'ts-jest': {
//       useESM: true
//     }
//   },
//   roots: ['<rootDir>'],
// }

export default config;