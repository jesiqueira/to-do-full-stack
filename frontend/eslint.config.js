import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // ===================================
  // 0. Ambiente Browser
  // ===================================
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },

  // ===================================
  // 1. Configuração Básica do JavaScript
  // ===================================
  js.configs.recommended,

  // ===================================
  // 2. Configuração do TypeScript + React Hooks
  // ===================================
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      tseslint.configs.recommended,
      // ⬇️ REMOVIDO tseslint.configs.strict (precisa de type info)
    ],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // RIGOR NA TIPAGEM E SEGURANÇA (regras que NÃO precisam de type info)
      '@typescript-eslint/explicit-function-return-type': 'off', // ⬅️ DESLIGADO (precisa type info)
      '@typescript-eslint/no-floating-promises': 'off', // ⬅️ DESLIGADO (precisa type info)
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // MODERNIZAÇÃO E PREVENÇÃO DE BUGS
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
      'no-unused-expressions': 'error',
      'no-shadow': 'error',

      // REACT HOOKS
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',

      // CUSTOMIZADAS
      '@typescript-eslint/member-ordering': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }], // ⬅️ Permite apenas console.warn e console.error
    },
  },

  // ===================================
  // 3. React Refresh
  // ===================================
  {
    files: ['**/*.tsx'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
    },
  },

  // ===================================
  // 4. Ignorância de arquivos
  // ===================================
  globalIgnores(['dist', 'node_modules', '*.config.js']),
])
