import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'

interface HttpError extends Error {
  status?: number
}

const app = express()

// ⬇️ 1. CONFIGURAÇÃO DO CORS
// Em produção trocar o localhost pelo domínio do front-end ex: https://seufrotend.com.br
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
)

app.use(express.json())

// Import e uso de Rotas
// app.use('/api', Rota)

// Boas Práticas: Middleware 404
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    message: 'Rota não encontrada.',
    path: req.path,
  })
})

// Boas Práticas: Middleware de tratamento de erro global
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
    },
  })
})

export default app
