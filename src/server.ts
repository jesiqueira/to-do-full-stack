/**
 * src/server.ts
 *
 * Ponto de entrada principal da aplicação.
 * Responsável por:
 * 1. Importar a configuração e a conexão do Sequelize.
 * 2. Testar a conexão com o banco.
 * 3. Iniciar o servidor Express.
 */

import 'dotenv/config'
import app from './app'
import { connectDatabase } from './database/connection'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

/**
 * Função principal assíncrona para inicializar a aplicação
 */
async function initializeApp(): Promise<void> {
  try {
    // 1. Testa conexão com o banco
    await connectDatabase()
    console.log('✅ Banco de dados conectado com sucesso!')

    // 2. Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
      console.log(`⚙️ Ambiente: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro de inicialização desconhecido.'
    console.error('❌ ERRO DURANTE A INICIALIZAÇÃO DA APLICAÇÃO:', message)
    process.exit(1)
  }
}

// Inicia a aplicação
void initializeApp()

// ⬇️ Tratamento de erros globais
process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Encerrando...')
  console.error('Nome:', err.name)
  console.error('Mensagem:', err.message)
  console.error('Stack:', err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('❌ UNHANDLED REJECTION! Encerrando...')
  if (reason instanceof Error) {
    console.error('Razão:', reason.message)
  } else {
    console.error('Razão:', reason)
  }
  console.error('Promise:', promise)
  process.exit(1)
})
