/**
 * __tests__/setup/jest.setup.ts
 * Setup global do Jest
 */
import dotenv from 'dotenv'

// Configura dotenv SEM logs
dotenv.config({
  quiet: true, // ✅ Isso desabilita os logs do dotenv
})

// Força o ambiente de teste
process.env.NODE_ENV = 'test'

console.log = jest.fn() // ✅ Silencia todos os console.log
console.warn = jest.fn() // ✅ Silencia warnings
console.error = jest.fn() // ✅ Mantém errors ou silencia se quiser

// Configurações globais do Jest
jest.setTimeout(10000) // 10 segundos

// Configurações iniciais - SEM funções do Jest aqui
// console.log('🔧 Ambiente de teste configurado')
