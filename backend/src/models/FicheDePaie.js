import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class FicheDePaie extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      mois: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      annee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      montantNet: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      heuresTravaillees: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      heuresSupplementaires: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      employe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Employe', key: 'id' },
      },
    }, {
      sequelize,
      tableName: 'FicheDePaie',
      timestamps: false,
    });
  }
}
