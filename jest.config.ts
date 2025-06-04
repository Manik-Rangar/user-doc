import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@jkt/config(.*)$': '<rootDir>/shared/config$1',
    '^@jkt/constants(.*)$': '<rootDir>/shared/constants$1',
    '^@jkt/dto(.*)$': '<rootDir>/shared/dto$1',
    '^@jkt/enums(.*)$': '<rootDir>/shared/enums$1',
    '^@jkt/types(.*)$': '<rootDir>/shared/types$1',
    '^@jkt/guards(.*)$': '<rootDir>/shared/guards$1',
    '^@jkt/models(.*)$': '<rootDir>/shared/database/models$1',
    '^@jkt/nest-utils(.*)$': '<rootDir>/shared/nest$1',
    '^@jkt/jwt(.*)$': '<rootDir>/shared/jwt$1',
    '^@jkt/services(.*)$': '<rootDir>/shared/services$1',
  },
};

export default config;
