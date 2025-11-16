// eslint.config.mjs
import eslintJs from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  // ===================================
  // 0. Ambiente Node.js (AGORA O PRIMEIRO BLOCO)
  // Define variáveis globais (console, process, etc.) para todos os arquivos.
  // ===================================
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // ===================================
  // 1. Configuração Básica do JavaScript
  // ===================================
  {
    ...eslintJs.configs.recommended,
  },

  // ===================================
  // 2. Configuração do TypeScript (ALTO RIGOR)
  // ===================================
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      // O globals.node foi movido para o bloco 0 e é aplicado globalmente
      parser: typescriptParser,
      parserOptions: {
        // project: './tsconfig.json',
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Desativa as regras JS que conflitam com o TS
      ...typescriptEslint.configs['eslint-recommended'].rules,

      // ⬇️ AUMENTANDO O RIGOR: Usa as regras 'STRICT' do TypeScript ESLint ⬇️
      // Isso impõe um padrão de código muito mais alto.
      ...typescriptEslint.configs.strict.rules,

      // ----------------------------------------------------
      // ⬇️ REGRAS ADICIONADAS PARA MELHOR PADRÃO ⬇️
      // ----------------------------------------------------

      // RIGOR NA TIPAGEM E SEGURANÇA
      '@typescript-eslint/explicit-function-return-type': 'error', // Força tipo de retorno
      '@typescript-eslint/no-floating-promises': 'error', // Obriga a tratar Promises
      '@typescript-eslint/consistent-type-imports': 'error', // Força 'import type'
      '@typescript-eslint/no-non-null-assertion': 'warn', // Desencoraja o '!'

      // MODERNIZAÇÃO E PREVENÇÃO DE BUGS (Substitui ou complementa o padrão TS)
      'no-var': 'error', // Força const/let (VOCÊ JÁ TINHA INCLUÍDO!)
      'prefer-const': 'error', // Força 'const' se não houver reatribuição
      eqeqeq: 'error', // Força '===' (evita coerção de tipo)
      'no-unused-expressions': 'error', // Proíbe expressões sem efeito
      'no-shadow': 'error', // Impede sombreamento de variáveis

      // ----------------------------------------------------
      // ⬇️ SUAS REGRAS CUSTOMIZADAS ⬇️
      // ----------------------------------------------------

      '@typescript-eslint/member-ordering': 'off', // Desligado para flexibilidade
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn', // Permite 'any' com aviso
      'no-console': 'off', // Permite console.log
    },
  },

  // ===================================
  // 3. Plugin Prettier
  // ===================================
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // ===================================
  // 4. Configuração Prettier (DESLIGA conflitos)
  // ===================================
  eslintConfigPrettier,

  // ===================================
  // 5. Regras de Ignorância
  // ===================================
  {
    ignores: ['node_modules', 'dist', 'package-lock.json', '*.js'],
  },
]
