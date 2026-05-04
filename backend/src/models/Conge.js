import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class Conge extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      dateDebut: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      dateFin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      motif: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // Statut : "En attente", "Validé" ou "Refusé"
      statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'En attente',
      },
      employe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Employe', key: 'id' },
      },
    }, {
      sequelize,
      tableName: 'Conge',
      timestamps: false,
    });
  }
}
