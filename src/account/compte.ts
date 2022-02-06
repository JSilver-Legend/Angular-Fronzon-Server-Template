import { authMiddleware } from '../auth';
import { Sequelize, sequelize } from '../const';
import { User } from '../user';

export const Compte = sequelize.define(
  'compte',
  {
    intitule: { type: Sequelize.STRING, allowNull: false },
    code: { type: Sequelize.STRING(10), allowNull: false, unique: true },
    derniereDateSortie: { type: Sequelize.DATE },
    cumulSorties: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { freezeTableName: true }
);

export const EtatCompte = sequelize.define(
  'etat_compte',
  {
    solde: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
    mois: { type: Sequelize.INTEGER, allowNull: false },
    annee: { type: Sequelize.INTEGER, allowNull: false },
  },
  { freezeTableName: true }
);

export const EquationRepartition = sequelize.define(
  'equation_repartition',
  {
    script: { type: Sequelize.TEXT, allowNull: false },
    formatAffichable: { type: Sequelize.TEXT, allowNull: false },
    date: { type: Sequelize.DATE, allowNull: false },
  },
  { freezeTableName: true }
);

export const Departement = sequelize.define(
  'departement',
  {
    intitule: { type: Sequelize.STRING, allowNull: false },
    label: { type: Sequelize.STRING, allowNull: false },
    parent: { type: Sequelize.INTEGER, defaultValue: 0 },
    typeVersement: {
      type: Sequelize.ENUM('JOURNALIER', 'FINMOIS', 'DEBUTMOIS'),
    },
  },
  { freezeTableName: true }
);

export const Reception = sequelize.define(
  'reception',
  {
    intitule: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING },
  },
  { freezeTableName: true }
);

export const AssociationCompteDepartement = sequelize.define(
  'departement_compte',
  {},
  { freezeTableName: true }
);

export const AssociationUtilisateurDepartement = sequelize.define(
  'utilisateur_departement',
  {},
  { freezeTableName: true }
);

export const DepartementAuthorization = sequelize.define(
  'autorisation_departement',
  {
    ecriture: { type: Sequelize.BOOLEAN, defaultValue: false },
    lecture: { type: Sequelize.BOOLEAN, defaultValue: false },
    modification: { type: Sequelize.BOOLEAN, defaultValue: false },
  },
  { freezeTableName: true }
);

Reception.hasMany(Departement, { as: 'departements', foreignKey: 'reception' });
Compte.hasMany(AssociationCompteDepartement, {
  as: 'departementAutorises',
  foreignKey: 'compte',
});
Departement.hasMany(AssociationCompteDepartement, {
  as: 'comptesAutorises',
  foreignKey: 'departement',
});
Departement.hasMany(EquationRepartition, {
  as: 'equationsRepartitions',
  foreignKey: 'departement',
});
User.hasMany(AssociationUtilisateurDepartement, {
  as: 'departements',
  foreignKey: 'utilisateur',
});
Departement.hasMany(AssociationUtilisateurDepartement, {
  as: 'utilisateurs',
  foreignKey: 'departement',
});
User.hasMany(AssociationUtilisateurDepartement, {
  as: 'receptions',
  foreignKey: 'utilisateur',
});
User.hasMany(DepartementAuthorization, {
  as: 'autorisations',
  foreignKey: 'utilisateur',
});
Departement.hasMany(DepartementAuthorization, {
  as: 'utilisateursAutorises',
  foreignKey: 'departement',
});
Compte.hasMany(EtatCompte, {
  as: 'etats',
  foreignKey: 'idCompte',
});
EtatCompte.belongsTo(Compte, {
  as: 'compte',
  foreignKey: 'idCompte',
});
export const setupAccountEndpoint = (finale: any) => {
  const departements = finale.resource({
    model: Departement,
    endpoints: ['/departements', '/departements/:id'],
  });
  departements.all.auth(authMiddleware);

  const comptes = finale.resource({
    model: Compte,
    associations: true,
    endpoints: ['/comptes', '/comptes/:id'],
  });
  comptes.all.auth(authMiddleware);

  const equations = finale.resource({
    model: EquationRepartition,
    associations: true,
    endpoints: ['/equations', '/equations/:id'],
    search: [
      {
        operator: Sequelize.Op.lte,
        param: 'lowerDateBound',
        attributes: ['date'],
      },
    ],
  });
  equations.all.auth(authMiddleware);

  const receptions = finale.resource({
    model: Reception,
    associations: true,
    endpoints: ['/receptions', '/receptions/:id'],
  });
  receptions.all.auth(authMiddleware);
};
