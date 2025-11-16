// src/schemas/interfaces/IUsuarioSchemas.ts

export interface ICriarUsuarioDTO {
  nome: string
  email: string
  password: string
}

export interface ILoginDTO {
  email: string
  password: string
}

export type IAtualizarUsuarioDTO = {
  nome?: string | undefined
  email?: string | undefined
}

export interface IUsuarioResponseDTO {
  id: number
  nome: string
  email: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ILoginResponseDTO {
  usuario: IUsuarioResponseDTO
  token: string
}
