/**
 * src/database/connection.ts
 * Configura e inicializa a conexão do Sequelize + Models.
 * TEMPLATE - Adapte para seu projeto
 */

import { Sequelize } from 'sequelize'
import type { Model, ModelStatic } from 'sequelize'
import databaseConfig from './config'

// =======================================================
// 📁 MODELOS - IMPORTE SEUS MODELOS AQUI
// =======================================================

// EXEMPLOS (descomente e adapte):
// import User from './models/User'
// import Tarefa from './models/Tarefa'
// import { Product, Category } from './models'

// =======================================================
// Tipagem auxiliar: qualquer Model que possa ter associate()
// =======================================================
type AssociableModel = ModelStatic<Model> & {
  associate?: (models: Record<string, AssociableModel>) => void
}

// =======================================================
// 1. Ambiente + Configuração
// =======================================================
const env = process.env.NODE_ENV || 'development'
const config = databaseConfig[env]

// =======================================================
// 2. Instância do Sequelize
// =======================================================
export const sequelize = new Sequelize(config)

// =======================================================
// 3. Inicializa Models (COMENTADO - DESCOMENTE QUANDO CRIAR SEUS MODELOS)
// =======================================================

// EXEMPLOS (descomente e adapte):
// User.initialize(sequelize)
// Tarefa.initModel(sequelize)
// Product.initModel(sequelize)
// Category.initModel(sequelize)

// =======================================================
// 4. Define associações automaticamente
// =======================================================
const models = sequelize.models as Record<string, AssociableModel>

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models)
  }
})

// ----------------------------------------------------
// 5. Teste de conexão
// ----------------------------------------------------
export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate()
    console.log(`✅ Conexão (${env}) bem-sucedida.`)
  } catch (error) {
    console.error('❌ Falha ao conectar:', (error as Error).message)
    process.exit(1)
  }
}

export default sequelize
