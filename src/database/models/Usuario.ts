/**
 * src/database/models/Usuario.ts
 * Define a entidade da tabela 'usuario' com tipagem forte.
 */
import { DataTypes, Model } from 'sequelize'
import type { Optional, Sequelize, ModelStatic } from 'sequelize'

// ----------------------------------------------------------------------
// 1. Definições de Tipagem
// ----------------------------------------------------------------------

export const USUARIO_TABLE_NAME = 'usuarios'

// Atributos que são lidos do banco
interface UsuarioAttributes {
  id: number
  nome: string
  email: string
  // O nome do campo foi ajustado para 'passwordHash'
  passwordHash: string
  createdAt?: Date
  updatedAt?: Date
}

// Atributos opcionais na criação (id, timestamps)
// Usando 'type' para evitar o aviso do ESLint
export type UsuarioCreationAttributes = Optional<UsuarioAttributes, 'id' | 'createdAt' | 'updatedAt'>

// ----------------------------------------------------------------------
// 2. Definição da Classe do Modelo
// ----------------------------------------------------------------------
// Implementa a interface para garantir que a classe e a interface sejam sincronizadas
export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  // Campos obrigatórios (definidos pela interface)
  declare id: number
  declare nome: string
  declare email: string
  declare passwordHash: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // Método estático para inicializar o Model
  public static initModel(sequelize: Sequelize): void {
    Usuario.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        passwordHash: {
          // No seu esquema antigo era 'senha', aqui é renomeado
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: USUARIO_TABLE_NAME,
        modelName: 'Usuario',
        timestamps: true,
        underscored: true, // Use snake_case no banco de dados (created_at)
      },
    )
  }

  /**
   * Define as associações do Model (deve ser chamado APÓS todos os Models terem sido inicializados).
   */
  public static associate({ Tarefa }: Record<string, ModelStatic<Model>>): void {
    if (Tarefa) {
      Usuario.hasMany(Tarefa, { foreignKey: 'usuarioId', as: 'tarefas' })
    }
  }
}

// Exporta o Model para ser usado no arquivo de conexão
export default Usuario
