// src/database/database.ts
import 'dotenv/config'
import type { Options } from 'sequelize'
import databaseConfig from './config'

const env = process.env.NODE_ENV ?? 'development'
const currentConfig = databaseConfig[env] as Options

export default currentConfig
