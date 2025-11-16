/**
 * __tests__/setup/setupDatabase.ts
 * Setup do banco de dados para testes - AQUI sim pode usar funções do Jest
 */
import { sequelize } from '../../src/database/connection'

// Verifica se estamos no ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  throw new Error('❌ setupDatabase só deve ser usado em ambiente de teste!')
}

beforeAll(async () => {
  try {
    // console.log('🔄 Sincronizando banco de testes...')
    // Força a recriação do banco
    await sequelize.sync({ force: true })
    // console.log('✅ Banco de testes sincronizado')
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de testes:', error)
    throw error
  }
})

beforeEach(async () => {
  try {
    // Limpa dados de TODAS as tabelas antes de cada teste
    const models = sequelize.models

    await Promise.all(Object.values(models).map((model) => model.destroy({ where: {}, force: true })))
    // console.log('🧹 Dados limpos antes do teste')
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error)
    throw error
  }
})

afterAll(async () => {
  try {
    await sequelize.close()
    // console.log('✅ Conexão com banco de testes fechada')
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error)
  }
})
