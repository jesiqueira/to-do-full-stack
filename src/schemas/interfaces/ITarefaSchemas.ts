// src/schemas/interfaces/ITarefaSchemas.ts

export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida'

export interface ICriarTarefaDTO {
  titulo: string
  descricao?: string | undefined | null
  usuarioId: number
  status?: StatusTarefa
}

export interface IAtualizarTarefaDTO {
  titulo?: string | undefined
  descricao?: string | undefined | null
  status?: StatusTarefa | undefined
}

export interface IFiltroTarefaDTO {
  page?: number
  limit?: number
  titulo?: string | undefined
  status?: StatusTarefa | undefined
  usuarioId?: number | undefined
  criadoApos?: string | undefined
  criadoAntes?: string | undefined
  ordenarPor?: 'id' | 'titulo' | 'status' | 'createdAt' | 'updatedAt'
  ordenarDirecao?: 'ASC' | 'DESC'
}

export interface ITarefaResponseDTO {
  id: number
  titulo: string
  descricao: string | null
  status: StatusTarefa
  usuarioId: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ITarefaListaResponseDTO {
  dados: ITarefaResponseDTO[]
  paginacao: {
    pagina: number
    limite: number
    total: number
    totalPaginas: number
  }
}
