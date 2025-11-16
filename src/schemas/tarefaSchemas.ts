// src/schemas/tarefaSchemas.ts

import { z } from 'zod'

import type { ICriarTarefaDTO, IAtualizarTarefaDTO, IFiltroTarefaDTO } from './interfaces/ITarefaSchemas'

// Enum de Status
export const StatusTarefaEnum = z.enum(['pendente', 'em_andamento', 'concluida'])

// Schema de validação
export const criarTarefaSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatorio')
    .max(255)
    .transform((str) => str.trim()),
  descricao: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((str) => str?.trim()),
  status: StatusTarefaEnum.default('pendente'),
}) satisfies z.ZodType<Omit<ICriarTarefaDTO, 'usuarioId'>>

export const atualizarTarefaSchema: z.ZodType<IAtualizarTarefaDTO> = z
  .object({
    titulo: z
      .string()
      .min(1)
      .max(255)
      .transform((str) => str.trim())
      .optional(),
    descricao: z
      .string()
      .max(1000)
      .optional()
      .nullable()
      .transform((str) => str?.trim())
      .nullable(),
    status: StatusTarefaEnum.optional(),
  })
  .refine((data) => Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined), {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  })

export const filtroTarefaSchema: z.ZodType<IFiltroTarefaDTO> = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    titulo: z.string().min(1).max(255).optional(),
    status: StatusTarefaEnum.optional(),
    usuarioId: z.coerce.number().int().positive().optional(),
    criadoApos: z.iso.datetime().optional(),
    criadoAntes: z.iso.datetime().optional(),
    ordenarPor: z.enum(['id', 'titulo', 'status', 'createdAt', 'updatedAt']).default('createdAt'),
    ordenarDirecao: z.enum(['ASC', 'DESC']).default('DESC'),
  })
  .refine(
    (data) => {
      if (data.criadoApos && data.criadoAntes) {
        return new Date(data.criadoApos) <= new Date(data.criadoAntes)
      }
      return true
    },
    {
      message: "Data 'criadoApos' deve ser anterior ou igual a 'criadoAntes'",
      path: ['criadoApos'],
    },
  )

export const parametrosTarefaSchema = z.object({
  id: z.coerce.number().int().positive(),
})
