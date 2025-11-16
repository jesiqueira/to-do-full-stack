// src/__tests__/schemas/tarefaSchemas.test.ts

import {
  criarTarefaSchema,
  atualizarTarefaSchema,
  filtroTarefaSchema,
  parametrosTarefaSchema,
  StatusTarefaEnum,
} from '../../src/schemas/tarefaSchemas'

describe('Tarefa Schemas', () => {
  describe('StatusTarefaEnum', () => {
    it('deve aceitar valores válidos do enum', () => {
      expect(StatusTarefaEnum.parse('pendente')).toBe('pendente')
      expect(StatusTarefaEnum.parse('em_andamento')).toBe('em_andamento')
      expect(StatusTarefaEnum.parse('concluida')).toBe('concluida')
    })

    it('deve rejeitar valores inválidos', () => {
      expect(() => StatusTarefaEnum.parse('invalido')).toThrow()
      expect(() => StatusTarefaEnum.parse('')).toThrow()
      expect(() => StatusTarefaEnum.parse(null)).toThrow()
    })
  })

  describe('criarTarefaSchema', () => {
    it('deve validar dados corretos para criar tarefa', () => {
      const validData = {
        titulo: 'Tarefa de Teste',
        descricao: 'Descrição da tarefa',
        status: 'pendente',
      }

      const result = criarTarefaSchema.parse(validData)

      expect(result).toEqual({
        titulo: 'Tarefa de Teste',
        descricao: 'Descrição da tarefa',
        status: 'pendente',
      })
    })

    it('deve aplicar transformações corretamente', () => {
      const dataWithSpaces = {
        titulo: '  Tarefa com espaços  ',
        descricao: '  Descrição com espaços  ',
      }

      const result = criarTarefaSchema.parse(dataWithSpaces)

      expect(result.titulo).toBe('Tarefa com espaços')
      expect(result.descricao).toBe('Descrição com espaços')
    })

    it('deve usar status padrão quando não fornecido', () => {
      const dataWithoutStatus = {
        titulo: 'Tarefa sem status',
      }

      const result = criarTarefaSchema.parse(dataWithoutStatus)

      expect(result.status).toBe('pendente')
    })

    it('deve transformar descrição vazia para string vazia', () => {
      const dataWithEmptyDescription = {
        titulo: 'Tarefa com descrição vazia',
        descricao: '   ',
      }

      const result = criarTarefaSchema.parse(dataWithEmptyDescription)

      expect(result.descricao).toBe('')
    })

    it('deve rejeitar quando título está vazio', () => {
      const invalidData = {
        titulo: '',
      }

      expect(() => criarTarefaSchema.parse(invalidData)).toThrow('Título é obrigatorio')
    })

    it('deve rejeitar quando título é muito longo', () => {
      const invalidData = {
        titulo: 'a'.repeat(256),
      }

      expect(() => criarTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar quando descrição é muito longa', () => {
      const invalidData = {
        titulo: 'Tarefa válida',
        descricao: 'a'.repeat(1001),
      }

      expect(() => criarTarefaSchema.parse(invalidData)).toThrow()
    })
  })

  describe('atualizarTarefaSchema', () => {
    it('deve validar atualização com todos os campos', () => {
      const validData = {
        titulo: 'Novo título',
        descricao: 'Nova descrição',
        status: 'concluida',
      }

      const result = atualizarTarefaSchema.parse(validData)

      expect(result).toEqual({
        titulo: 'Novo título',
        descricao: 'Nova descrição',
        status: 'concluida',
      })
    })

    it('deve validar atualização com apenas um campo', () => {
      const singleFieldData = {
        titulo: 'Apenas título atualizado',
      }

      const result = atualizarTarefaSchema.parse(singleFieldData)

      expect(result.titulo).toBe('Apenas título atualizado')
    })

    it('deve validar atualização com campo descricao explícito', () => {
      const descricaoData = {
        descricao: 'Nova descrição',
      }

      const result = atualizarTarefaSchema.parse(descricaoData)

      expect(result.descricao).toBe('Nova descrição')
    })

    it('deve validar atualização com campo status', () => {
      const statusData = {
        status: 'em_andamento',
      }

      const result = atualizarTarefaSchema.parse(statusData)

      expect(result.status).toBe('em_andamento')
    })

    it('deve aplicar transformações nos campos de texto', () => {
      const dataWithSpaces = {
        titulo: '  Título com espaços  ',
        descricao: '  Descrição com espaços  ',
      }

      const result = atualizarTarefaSchema.parse(dataWithSpaces)

      expect(result.titulo).toBe('Título com espaços')
      expect(result.descricao).toBe('Descrição com espaços')
    })

    it('deve transformar descrição vazia para string vazia', () => {
      const dataWithEmptyDescription = {
        descricao: '   ',
      }

      const result = atualizarTarefaSchema.parse(dataWithEmptyDescription)

      expect(result.descricao).toBe('')
    })

    it('deve rejeitar objeto vazio', () => {
      const emptyData = {}

      expect(() => atualizarTarefaSchema.parse(emptyData)).toThrow('Pelo menos um campo deve ser fornecido para atualização')
    })

    it('deve rejeitar todos os campos como undefined', () => {
      const allUndefinedData = {
        titulo: undefined,
        descricao: undefined,
        status: undefined,
      }

      expect(() => atualizarTarefaSchema.parse(allUndefinedData)).toThrow('Pelo menos um campo deve ser fornecido para atualização')
    })

    it('deve rejeitar quando título está vazio', () => {
      const invalidData = {
        titulo: '',
      }

      expect(() => atualizarTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar quando título é muito longo', () => {
      const invalidData = {
        titulo: 'a'.repeat(256),
      }

      expect(() => atualizarTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar quando descrição é muito longa', () => {
      const invalidData = {
        descricao: 'a'.repeat(1001),
      }

      expect(() => atualizarTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar status inválido', () => {
      const invalidData = {
        status: 'status_invalido',
      }

      expect(() => atualizarTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve retornar apenas campos definidos após o parse', () => {
      const data = {
        titulo: 'Novo título',
        status: 'em_andamento',
      }

      const result = atualizarTarefaSchema.parse(data)

      expect(result.titulo).toBe('Novo título')
      expect(result.status).toBe('em_andamento')
    })
  })

  describe('filtroTarefaSchema', () => {
    it('deve usar valores padrão quando nenhum filtro é fornecido', () => {
      const emptyData = {}

      const result = filtroTarefaSchema.parse(emptyData)

      expect(result).toEqual({
        page: 1,
        limit: 25,
        ordenarPor: 'createdAt',
        ordenarDirecao: 'DESC',
      })
    })

    it('deve validar filtros completos', () => {
      const completeData = {
        page: 2,
        limit: 50,
        titulo: 'Tarefa',
        status: 'em_andamento',
        usuarioId: 1,
        criadoApos: '2023-01-01T00:00:00Z',
        criadoAntes: '2023-12-31T23:59:59Z',
        ordenarPor: 'titulo',
        ordenarDirecao: 'ASC',
      }

      const result = filtroTarefaSchema.parse(completeData)

      expect(result).toEqual(completeData)
    })

    it('deve converter strings para números nos campos page e limit', () => {
      const stringData = {
        page: '2',
        limit: '50',
      }

      const result = filtroTarefaSchema.parse(stringData)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(50)
    })

    it('deve rejeitar quando page é menor que 1', () => {
      const invalidData = {
        page: 0,
      }

      expect(() => filtroTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar quando limit é maior que 100', () => {
      const invalidData = {
        limit: 101,
      }

      expect(() => filtroTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar quando criadoApos é depois de criadoAntes', () => {
      const invalidData = {
        criadoApos: '2023-12-31T00:00:00Z',
        criadoAntes: '2023-01-01T00:00:00Z',
      }

      expect(() => filtroTarefaSchema.parse(invalidData)).toThrow("Data 'criadoApos' deve ser anterior ou igual a 'criadoAntes'")
    })

    it('deve aceitar quando criadoApos é igual a criadoAntes', () => {
      const validData = {
        criadoApos: '2023-01-01T00:00:00Z',
        criadoAntes: '2023-01-01T00:00:00Z',
      }

      expect(() => filtroTarefaSchema.parse(validData)).not.toThrow()
    })

    it('deve rejeitar data inválida', () => {
      const invalidData = {
        criadoApos: 'data-invalida',
      }

      expect(() => filtroTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar ordenarPor inválido', () => {
      const invalidData = {
        ordenarPor: 'campo_invalido',
      }

      expect(() => filtroTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar ordenarDirecao inválido', () => {
      const invalidData = {
        ordenarDirecao: 'INVALIDO',
      }

      expect(() => filtroTarefaSchema.parse(invalidData)).toThrow()
    })
  })

  describe('parametrosTarefaSchema', () => {
    it('deve validar ID válido como número', () => {
      const validData = {
        id: 1,
      }

      const result = parametrosTarefaSchema.parse(validData)

      expect(result).toEqual({ id: 1 })
    })

    it('deve converter string para número', () => {
      const stringData = {
        id: '123',
      }

      const result = parametrosTarefaSchema.parse(stringData)

      expect(result.id).toBe(123)
    })

    it('deve rejeitar ID zero', () => {
      const invalidData = {
        id: 0,
      }

      expect(() => parametrosTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar ID negativo', () => {
      const invalidData = {
        id: -1,
      }

      expect(() => parametrosTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar ID decimal', () => {
      const invalidData = {
        id: 1.5,
      }

      expect(() => parametrosTarefaSchema.parse(invalidData)).toThrow()
    })

    it('deve rejeitar string não numérica', () => {
      const invalidData = {
        id: 'abc',
      }

      expect(() => parametrosTarefaSchema.parse(invalidData)).toThrow()
    })
  })
})
