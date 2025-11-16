/**
 * src/database/models/Tarefa.ts
 * Define a entidade da tabela 'tarefas' com tipagem forte.
 */
import { DataTypes, Model } from 'sequelize'
import type { Optional, Sequelize, ModelStatic } from 'sequelize'

// ----------------------------------------------------------------------
// 1. Definições de ENUM (Status)
// ----------------------------------------------------------------------
// Usamos 'as const' para garantir que os valores sejam literais de string (tipagem forte)
export const TAREFA_STATUS_VALUES = ['pendente', 'em_andamento', 'concluida'] as const
type TarefaStatus = (typeof TAREFA_STATUS_VALUES)[number]

export const TAREFA_TABLE_NAME = 'tarefas'

// ----------------------------------------------------------------------
// 2. Definições de Interface para Tipagem (TypeScript)
// ----------------------------------------------------------------------

export interface TarefaAttributes {
  id: number
  titulo: string // Novo nome do campo
  descricao: string | null // Novo nome do campo
  status: TarefaStatus // Usando o novo tipo
  usuarioId: number // Chave estrangeira (FK)
  createdAt?: Date
  updatedAt?: Date
}

// Atributos opcionais na criação (id, timestamps)
export type TarefaCreationAttributes = Optional<TarefaAttributes, 'id' | 'createdAt' | 'updatedAt' | 'descricao' | 'status'>

// ----------------------------------------------------------------------
// 3. Definição da Classe do Modelo
// ----------------------------------------------------------------------
export class Tarefa extends Model<TarefaAttributes, TarefaCreationAttributes> implements TarefaAttributes {
  // Campos obrigatórios (definidos pela interface)
  declare id: number
  declare titulo: string
  declare descricao: string | null
  declare status: TarefaStatus
  declare usuarioId: number

  // Timestamps
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // Método estático para inicializar o Model
  public static initModel(sequelize: Sequelize): void {
    Tarefa.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        titulo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: 'tarefa_status_enum',
          defaultValue: 'pendente',
          validate: {
            isIn: {
              args: [TAREFA_STATUS_VALUES],
              msg: 'Status deve ser: pendente, em_andamento ou concluida',
            },
          },
        },
        usuarioId: {
          // O tipo é definido aqui. A restrição FK é adicionada na migration.
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: TAREFA_TABLE_NAME, // Usando o nome da tabela
        modelName: 'Tarefa', // O nome do Model (Convenção: Singular e PascalCase)
        timestamps: true,
        underscored: true,
      },
    )
  }

  /**
   * Define as associações do Model, após todos os Models terem sido inicializados.
   * Geralmente é usado para definir relacionamentos BelongsTo, HasMany, etc.
   */
  public static associate({ Usuario }: Record<string, ModelStatic<Model>>): void {
    if (Usuario) {
      Tarefa.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' })
    }
  }
}

// Exporta o Model para ser usado no arquivo de conexão
export default Tarefa
