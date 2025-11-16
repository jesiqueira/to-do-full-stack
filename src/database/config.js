require('dotenv').config()

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST ?? 'database',        // ← 'database' (nome do serviço)
    username: process.env.DB_USER ?? 'dev',         // ← 'dev' (usuário do Docker)
    password: process.env.DB_PASSWORD ?? 'dev123',  // ← 'dev123' (senha do Docker)
    database: process.env.DB_NAME ?? 'myapp',       // ← 'myapp' (database do Docker)
    port: Number(process.env.DB_PORT ?? 5432),
    logging: console.log,
  },

  // === TEST (SQLite in-memory) ===
  test: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || ':memory:',
    logging: false,
  },

  // === PROD (Postgres + SSL) ===
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST ?? 'database',        // ← Mesmo padrão
    username: process.env.DB_USER ?? 'dev',         // ← Mesmo padrão
    password: process.env.DB_PASSWORD ?? 'dev123',  // ← Mesmo padrão
    database: process.env.DB_NAME ?? 'myapp',       // ← Use DB_NAME, não DB_NAME_PROD
    port: Number(process.env.DB_PORT ?? 5432),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
}
