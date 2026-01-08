const config = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|js)$': 'babel-jest'
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
      "^#root/(.*).js$": "<rootDir>/$1.ts"
  }
};

export default config;