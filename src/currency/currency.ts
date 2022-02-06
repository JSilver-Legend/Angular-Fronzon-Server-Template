import { sequelize, Sequelize } from '../const';

export const Devise = sequelize.define(
  'devise',
  {
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
  },
  { freezeTableName: true }
);

export const TauxDeChange = sequelize.define(
  'taux_de_change',
  {
    de: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Devise,
        key: 'code',
      },
    },
    vers: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Devise,
        key: 'code',
      },
    },
    date: { type: Sequelize.DATE, allowNull: false },
    taux: { type: Sequelize.DOUBLE, allowNull: false },
  },
  { freezeTableName: true }
);
