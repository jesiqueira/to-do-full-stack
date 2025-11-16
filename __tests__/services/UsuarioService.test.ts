/**
 * tests/services/UsuarioService.test.ts
 * Testes para o UsuarioService
 */

import { Usuario } from '../../src/database/models/Usuario'
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository'
import { UsuarioService } from '../../src/services/UsuarioService'
import { UsuarioNaoEncontradoError, EmailEmUsoError } from '../../src/errors'
import type { ICriarUsuarioDTO } from '../../src/schemas/interfaces/IUsuarioSchemas'

describe('UsuariosService', () => {
  let usuarioService: UsuarioService
  let usuarioRepository: UsuarioRepository

  // Executa antes de cada teste
  beforeEach(async () => {
    usuarioRepository = new UsuarioRepository(Usuario)
    usuarioService = new UsuarioService(usuarioRepository)
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Métodos de Busca
  // --------------------------------------------------------------------
  describe('buscaPorEmail', () => {
    test('deve retorna um usuario quando email existe', async () => {
      // Arrange
      const email = 'teste@email.com'
      await Usuario.create({
        nome: 'Usuario Teste',
        email,
        passwordHash: 'hash123',
      })

      // Act
      const usuarioEncontrado = await usuarioService.buscarPorEmail(email)

      // Assert
      expect(usuarioEncontrado).toBeDefined()
      expect(usuarioEncontrado).not.toBeNull()
      expect(usuarioEncontrado?.email).toBe(email)
      expect(usuarioEncontrado?.nome).toBe('Usuario Teste')
    })

    test('deve retornar null quando email não existe', async () => {
      // Act
      const usuarioEncontrado = await usuarioService.buscarPorEmail('naoexiste@email.com')

      // Assert
      expect(usuarioEncontrado).toBeNull()
    })
  })

  describe('buscarPorId', () => {
    test('deve retornar um usuario quando ID existe', async () => {
      // Arrange
      const usuarioCriado = await Usuario.create({
        nome: 'Usuario para buscar por ID',
        email: 'buscaid@email.com',
        passwordHash: 'hush_busca',
      })

      // Act
      const usuarioEncontrado = await usuarioService.buscarPorId(usuarioCriado.id)

      // Assert
      expect(usuarioEncontrado).toBeDefined()
      expect(usuarioEncontrado?.id).toBe(usuarioCriado.id)
      expect(usuarioEncontrado?.nome).toBe(usuarioCriado.nome)
      expect(usuarioEncontrado?.passwordHash).toBe(usuarioCriado.passwordHash)
    })

    test('deve retorna null quando ID não existir', async () => {
      // Act
      const usuarioEncontrado = await usuarioService.buscarPorId(99999)

      // Assert
      expect(usuarioEncontrado).toBeNull()
    })
  })

  describe('listaUsuarios', () => {
    test('deve retornar array vaxio quando não existir usuário', async () => {
      // Act
      const usuario = await usuarioService.listarUsuarios()

      // Assert
      expect(usuario).toEqual([])
      expect(usuario).toHaveLength(0)
    })

    test('deve retornar todos os usuários', async () => {
      // Arrange
      await Usuario.bulkCreate([
        {
          nome: 'Usuário 1',
          email: 'user1@email.com',
          passwordHash: 'hash1',
        },
        {
          nome: 'Usuário 2',
          email: 'user2@email.com',
          passwordHash: 'hash2',
        },
      ])

      // Act
      const usuarios = await usuarioService.listarUsuarios()

      // Assert
      expect(usuarios).toHaveLength(2)
      expect(usuarios[0]?.email).toBe('user1@email.com')
      expect(usuarios[1]?.email).toBe('user2@email.com')
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Métodos de Escrita
  // --------------------------------------------------------------------
  describe('métodos de escrita', () => {
    describe('criarUsuario', () => {
      test('deve criar um usuario com dados válidos', async () => {
        // Arrange
        const usuarioData: ICriarUsuarioDTO = {
          nome: 'Novo Usuário',
          email: 'novo@email.com',
          password: 'novo_hash',
        }

        // Act
        const usuarioCriado = await usuarioService.criarUsuario(usuarioData)

        // Assert
        expect(usuarioCriado).toBeDefined()

        if (usuarioCriado) {
          expect(usuarioCriado.id).toBeDefined()
          expect(usuarioCriado.nome).toBe(usuarioData.nome)
          expect(usuarioCriado.email).toBe(usuarioData.email)
          expect(usuarioCriado.passwordHash).toBe(usuarioCriado.passwordHash)
        }
      })

      test('deve lancar erro ao criar usuario com e-mail duplicado', async () => {
        // Arrange
        const email = 'duplicado@email.com'

        const usuarioData: ICriarUsuarioDTO = {
          nome: 'Primeiro Usuario',
          email,
          password: 'hash1',
        }

        // Criar o primeiro usuario
        await usuarioService.criarUsuario(usuarioData)

        // Act & Assert - Tenta criar segundo usuário com mesmo email
        await expect(
          usuarioService.criarUsuario({
            nome: 'Segundo Usuario',
            email,
            password: 'hash2',
          }),
        ).rejects.toThrow(EmailEmUsoError)
      })

      test('deve criar usuario com campos mínimos obrigatórios', async () => {
        // Arrange
        const usuarioMinimo: ICriarUsuarioDTO = {
          nome: 'Mínimo',
          email: 'minimo@email.com',
          password: 'hash_minimo',
        }

        // Act
        const usuarioCriado = await usuarioService.criarUsuario(usuarioMinimo)

        // Assert
        expect(usuarioCriado.id).toBeDefined()
        expect(usuarioCriado.nome).toBe('Mínimo')
        expect(usuarioCriado.email).toBe('minimo@email.com')
      })

      test('deve criptografar a senha ao criar usuário', async () => {
        // Arrange
        const senhaOriginal = 'minhaSenha123'

        // Act
        const usuarioCriado = await usuarioService.criarUsuario({
          nome: 'Usuário Teste',
          email: 'teste@email.com',
          password: senhaOriginal,
        })

        // Assert
        expect(usuarioCriado.passwordHash).not.toBe(senhaOriginal)
        expect(usuarioCriado.passwordHash).toHaveLength(60) // bcrypt
      })
    })

    describe('atualizarUsuario', () => {
      test('deve atualizar usuário existente', async () => {
        //Arrange
        const usuario = await Usuario.create({
          nome: 'Nome Original',
          email: 'original@email.com',
          passwordHash: 'hash_original',
        })

        // Act
        const usuarioAtualizado = await usuarioService.atualizarUsuario(usuario.id, {
          nome: 'Nome atualizado',
        })

        // Assert
        expect(usuarioAtualizado).toBeDefined()
        expect(usuarioAtualizado?.nome).toBe('Nome atualizado')
        expect(usuarioAtualizado?.email).toBe('original@email.com')
      })

      test('deve atualizar múltiplios campos', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Nome Original',
          email: 'original@email.com',
          passwordHash: 'hash_original',
        })

        // Act
        const usuarioAtualizado = await usuarioService.atualizarUsuario(usuario.id, {
          nome: 'Nome novo',
          passwordHash: 'hash_novo',
        })

        // Assert
        expect(usuarioAtualizado?.nome).toBe('Nome novo')
        expect(usuarioAtualizado?.email).toBe('original@email.com')
        expect(usuarioAtualizado?.passwordHash).toBe('hash_novo')
      })

      test('deve lancar erro ao tentar atualizar usuario inexistente', async () => {
        // Atc & Assert
        await expect(usuarioService.atualizarUsuario(9999, { nome: 'Inexistente' })).rejects.toThrow(UsuarioNaoEncontradoError)
      })

      test('deve lancar erro ao tentar usar email de outro usuário', async () => {
        // Arrange
        const usuario1 = await Usuario.create({
          nome: 'Usuário 1',
          email: 'user1@email.com',
          passwordHash: 'hash1',
        })

        await Usuario.create({
          nome: 'Usuário 2',
          email: 'user2@email.com',
          passwordHash: 'hash2',
        })

        // Act & Assert
        await expect(usuarioService.atualizarUsuario(usuario1.id, { email: 'user2@email.com' })).rejects.toThrow(EmailEmUsoError)
      })

      test('deve permitir atualizar quando email é o mesmo do usuário', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Usuário teste',
          email: 'teste@email.com',
          passwordHash: 'hash_teste',
        })

        // Act - tenta atualiza para mesmo email
        const usuarioAtualizado = await usuarioService.atualizarUsuario(usuario.id, { email: 'teste@email.com' })

        // Assert - deve permitir é o mesmo email
        expect(usuarioAtualizado).toBeDefined()
        expect(usuarioAtualizado?.email).toBe('teste@email.com')
      })

      describe('atualizarUsuario - cenários de retorno null', () => {
        test('deve lançar erro quando update retorna null (race condition)', async () => {
          // Arrange
          const usuario = await Usuario.create({
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            passwordHash: 'hash123',
          })

          // Simula uma race condition: usuário existe no findById mas foi deletado antes do update
          const originalUpdate = usuarioRepository.update
          usuarioRepository.update = async (): Promise<Usuario | null> => {
            // Simula que o usuário foi deletado entre o findById e o update
            return null
          }

          // Act & Assert
          await expect(usuarioService.atualizarUsuario(usuario.id, { nome: 'Novo Nome' })).rejects.toThrow('Erro ao atualizar usuário')

          // Restaura
          usuarioRepository.update = originalUpdate
        })
      })
    })

    describe('deletarUsuario', () => {
      test('deletar usuario existente', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Usuário para Deletar',
          email: 'deletar@email.com',
          passwordHash: 'hash_delete',
        })

        //Act
        const resultado = await usuarioService.deletarUsuario(usuario.id)

        // Assert
        expect(resultado).toBe(true)

        // verificar que realmente foi excluído
        const usuarioDeletado = await usuarioService.buscarPorId(usuario.id)
        expect(usuarioDeletado).toBeNull()
      })

      test('deve lancar UsuarioNaoEncontradoError ao tentar usuário inexistente', async () => {
        // Act & Assert
        await expect(usuarioService.deletarUsuario(99999)).rejects.toThrow(UsuarioNaoEncontradoError)
      })
    })

    // --------------------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------------------

    describe('login', () => {
      test('deve fazer login com credenciais válidas', async () => {
        // Arrange
        const email = 'login@email.com'
        const password = 'senhaCorreta123'

        await usuarioService.criarUsuario({
          nome: 'Usuário Login',
          email,
          password: password,
        })

        // Act
        const resultado = await usuarioService.login({ email, password })

        // Assert
        expect(resultado.usuario.email).toBe(email)
        expect(resultado.token).toBeDefined()
        expect(typeof resultado.token).toBe('string')
      })

      test('deve lançar erro quando usuário não existe', async () => {
        // Arrange
        const dadosLogin = {
          email: 'naoexiste@email.com',
          password: 'qualquersenha',
        }

        // Act & Assert
        await expect(usuarioService.login(dadosLogin)).rejects.toThrow('Credenciais inválidas')
      })

      test('deve lançar erro com senha incorreta', async () => {
        // Arrange
        const email = 'teste@email.com'
        await usuarioService.criarUsuario({
          nome: 'Usuário Teste',
          email,
          password: 'senhaCorreta',
        })

        // Act & Assert
        await expect(usuarioService.login({ email, password: 'senhaErrada' })).rejects.toThrow('Credenciais inválidas')
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Cenários Especiais
  // --------------------------------------------------------------------
  describe('cenários especiais', () => {
    describe('com banco vazio', () => {
      test('listarUsuarios deve retornar array vazio', async () => {
        const usuarios = await usuarioService.listarUsuarios()
        expect(usuarios).toHaveLength(0)
      })

      test('buscarPorEmail deve retornar null para qualquer email', async () => {
        const usuario = await usuarioService.buscarPorEmail('qualquer@email.com')
        expect(usuario).toBeNull()
      })

      test('buscarPorId deve retornar null para qualquer ID', async () => {
        const usuario = await usuarioService.buscarPorId(1)
        expect(usuario).toBeNull()
      })

      test('deve lançar erro ao tentar deletar usuário inexistente', async () => {
        await expect(usuarioService.deletarUsuario(1)).rejects.toThrow('Usuário não encontrado')
      })
    })

    describe('com múltiplos usuários', () => {
      beforeEach(async () => {
        await Usuario.bulkCreate([
          { nome: 'Usuário A', email: 'a@email.com', passwordHash: 'hash_a' },
          { nome: 'Usuário B', email: 'b@email.com', passwordHash: 'hash_b' },
          { nome: 'Usuário C', email: 'c@email.com', passwordHash: 'hash_c' },
        ])
      })

      test('listarUsuarios deve retornar todos os usuários', async () => {
        const usuarios = await usuarioService.listarUsuarios()
        expect(usuarios).toHaveLength(3)
      })

      test('deve conseguir buscar cada usuário individualmente', async () => {
        const usuarioA = await usuarioService.buscarPorEmail('a@email.com')
        const usuarioB = await usuarioService.buscarPorEmail('b@email.com')
        const usuarioC = await usuarioService.buscarPorEmail('c@email.com')

        expect(usuarioA?.nome).toBe('Usuário A')
        expect(usuarioB?.nome).toBe('Usuário B')
        expect(usuarioC?.nome).toBe('Usuário C')
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Testes de Integração Completa
  // --------------------------------------------------------------------
  describe('integração entre métodos', () => {
    test('deve criar, buscar, atualizar e deletar um usuário', async () => {
      // Create
      const usuarioCriado = await usuarioService.criarUsuario({
        nome: 'Usuário Completo',
        email: 'completo@email.com',
        password: 'hash_completo',
      })

      // Find
      const usuarioEncontrado = await usuarioService.buscarPorId(usuarioCriado.id)
      expect(usuarioEncontrado?.email).toBe('completo@email.com')

      // Update
      const usuarioAtualizado = await usuarioService.atualizarUsuario(usuarioCriado.id, {
        nome: 'Usuário Atualizado',
      })
      expect(usuarioAtualizado?.nome).toBe('Usuário Atualizado')

      // Delete
      const deletado = await usuarioService.deletarUsuario(usuarioCriado.id)
      expect(deletado).toBe(true)

      // Verify
      const usuarioDeletado = await usuarioService.buscarPorId(usuarioCriado.id)
      expect(usuarioDeletado).toBeNull()
    })

    test('fluxo completo com validações de negócio', async () => {
      // Cria primeiro usuário
      const usuario1 = await usuarioService.criarUsuario({
        nome: 'Primeiro Usuário',
        email: 'primeiro@email.com',
        password: 'hash1',
      })

      // Tenta criar segundo com mesmo email - deve falhar
      await expect(
        usuarioService.criarUsuario({
          nome: 'Segundo Usuário',
          email: 'primeiro@email.com',
          password: 'hash2',
        }),
      ).rejects.toThrow(EmailEmUsoError)

      // Cria segundo usuário com email diferente
      const usuario2 = await usuarioService.criarUsuario({
        nome: 'Segundo Usuário',
        email: 'segundo@email.com',
        password: 'hash2',
      })

      // Tenta atualizar email do usuário1 para email do usuário2 - deve falhar
      await expect(usuarioService.atualizarUsuario(usuario1.id, { email: 'segundo@email.com' })).rejects.toThrow(EmailEmUsoError)

      // Deleta usuário1
      await usuarioService.deletarUsuario(usuario1.id)

      // Verifica que usuário1 foi deletado mas usuário2 ainda existe
      expect(await usuarioService.buscarPorId(usuario1.id)).toBeNull()
      expect(await usuarioService.buscarPorId(usuario2.id)).not.toBeNull()
    })
  })
})
