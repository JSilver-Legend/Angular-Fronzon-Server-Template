import { sequelize, Sequelize } from '../const';

export const Patient = sequelize.define(
  'patient',
  {
    nom: { type: Sequelize.STRING, allowNull: false },
    prenom: { type: Sequelize.STRING },
    postnom: { type: Sequelize.STRING },
    dateNaissance: { type: Sequelize.DATE },
    dateDeces: { type: Sequelize.DATE },
    addresse: { type: Sequelize.STRING },
    sexe: { type: Sequelize.ENUM('H', 'F'), defaultValue: 'H' },
  },
  { freezeTableName: true }
);
