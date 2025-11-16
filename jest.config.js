//jest.config.js

const { createDefaultPreset } = require('ts-jest')
const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  transform: {
    ...tsJestTransformCfg,
    '^.+\\.tsx?$': ['ts-jest', {}],
  },

  setupFiles: ['<rootDir>/__tests__/setup/jest.setup.ts'], // 👈 AQUI
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/setupDatabase.ts'],

  verbose: true,

  // ✅ ADICIONE ESTA CONFIGURAÇÃO PARA IGNORAR HELPERS
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/helpers/', // ← IGNORA HELPERS
    '/__tests__/factories/', // ← IGNORA FACTORIES
    '/__tests__/setup/', // ← IGNORA ARQUIVOS DE SETUP
  ],

  collectCoverage: true,
  coverageDirectory: 'coverage',
  
  collectCoverageFrom: [
    'src/**/*.ts', // INCLUI TUDO EM SRC

    // EXCLUSÕES (Ajuste ou adicione o que não é lógica de negócio/teste)
    '!src/server.ts', // Inicialização do servidor (apenas bootstrap)
    '!src/app.ts', // Definição da instância Express (sem lógica)
    '!src/database/config.ts', // Configurações do DB (sem lógica de execução)
    '!src/database/connection.ts', // Inicialização da conexão (sem lógica)
    '!src/database/database.ts',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
  ],

  // ADICIONE para ignorar declarações de tipos
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/',
    '/src/database/models/',
    '/src/schemas/',
    '/src/routes/',
    '/src/errors/',
    '/interfaces/',
    '\\.d\\.ts$',
  ],
  coverageReporters: ['text-summary', 'lcov', 'html'],

  testTimeout: 10000,
}
