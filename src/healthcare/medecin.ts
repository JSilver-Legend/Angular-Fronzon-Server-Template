import { Sequelize, sequelize } from '../const';

export const Medecin = sequelize.define(
  'medecin',
  {
    nom: { type: Sequelize.STRING },
    prenom: { type: Sequelize.STRING },
    postnom: { type: Sequelize.STRING },
    cnom: { type: Sequelize.STRING, unique: true },
  },
  { freezeTableName: true }
);

export const setupMedecinResouce = (finale: any) => {
  const medecins = finale.resource({
    model: Medecin,
    associations: true,
    pagination: false,
    endpoints: ['/medecins', '/medecins/:id'],
  });
};
