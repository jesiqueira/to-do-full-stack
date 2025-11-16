// src/schemas/usuarioSchemas.ts

import { z } from 'zod'

import type { ICriarUsuarioDTO, ILoginDTO, IAtualizarUsuarioDTO } from './interfaces/IUsuarioSchemas'

// Schemas de Validação
export const criarUsuarioSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100)
    .transform((str) => str.trim()),
  email: z
    .email('Email inválido')
    .max(255)
    .transform((str) => str.toLowerCase().trim()),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(255),
}) satisfies z.ZodType<ICriarUsuarioDTO>

export const loginSchema = z.object({
  email: z.email('Email inválido').transform((str) => str.toLowerCase().trim()),
  password: z.string().min(1, 'Senha é Obrigatória'),
}) satisfies z.ZodType<ILoginDTO>

export const atualizarUsuarioSchema: z.ZodType<IAtualizarUsuarioDTO> = z
  .object({
    nome: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(100)
      .transform((str) => str.trim())
      .optional(),
    email: z
      .email('Email inválido')
      .max(255)
      .transform((str) => str.toLowerCase().trim())
      .optional(),
  })
  .refine((data) => Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined), {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  })

export const parametrosUsuarioSchema = z.object({
  id: z.coerce.number().int('ID deve ser um número inteiro').positive('ID deve ser positivo'),
})
