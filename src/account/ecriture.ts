import { Request, Response } from 'express';
import { authMiddleware } from '../auth';
import { Sequelize, sequelize } from '../const';
import { Devise, TauxDeChange } from '../currency';
import { Compte, Departement } from './compte';
import { Document } from './document';

export const Ecriture = sequelize.define(
  'ecriture',
  {
    libele: { type: Sequelize.STRING, allowNull: false },
    montant: { type: Sequelize.DOUBLE, allowNull: false },
    ecart: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
    date: { type: Sequelize.DATE, allowNull: false },
    devise: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Devise,
        key: 'code',
      },
    },
  },
  { freezeTableName: true }
);

export const EcritureTresorerie = sequelize.define(
  'ecriture_tresorerie',
  {
    libele: { type: Sequelize.STRING, allowNull: false },
    montantSysteme: { type: Sequelize.DOUBLE, allowNull: false },
    montant: { type: Sequelize.DOUBLE, defaultValue: 0 },
    date: { type: Sequelize.DATE, allowNull: false },
    description: { type: Sequelize.TEXT },
    devise: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Devise,
        key: 'code',
      },
    },
  },
  { freezeTableName: true }
);

export const EcritureRepartition = sequelize.define(
  'ecriture_repartition',
  {
    montant: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
    sens: { type: Sequelize.ENUM('ENTREE', 'SORTIE'), allowNull: false },
    date: { type: Sequelize.DATE, allowNull: false },
  },
  { freezeTableName: true }
);

export const DetailsEcriture = sequelize.define(
  'details_ecriture',
  {
    typeEcriture: { type: Sequelize.STRING },
    detailS1: { type: Sequelize.STRING },
    detailS2: { type: Sequelize.STRING },
    detailS3: { type: Sequelize.STRING },
    detailS4: { type: Sequelize.STRING },
    detailS5: { type: Sequelize.STRING },
    detailN1: { type: Sequelize.DOUBLE },
    detailN2: { type: Sequelize.DOUBLE },
    detailN3: { type: Sequelize.DOUBLE },
    detailN4: { type: Sequelize.DOUBLE },
    detailN5: { type: Sequelize.DOUBLE },
  },
  { freezeTableName: true }
);

Document.hasMany(Ecriture, { as: 'lignes', foreignKey: 'document' });
Document.hasMany(EcritureTresorerie, {
  as: 'lignesTresorerie',
  foreignKey: 'document',
});
Departement.hasMany(Ecriture, { as: 'ecritures', foreignKey: 'departement' });
Departement.hasMany(EcritureTresorerie, {
  as: 'ecrituresTresorerie',
  foreignKey: 'departement',
});
Compte.hasMany(EcritureTresorerie, {
  as: 'ecrituresTresorerie',
  foreignKey: 'compte',
});
EcritureRepartition.belongsTo(Departement, {
  as: 'departementOrigine',
  foreignKey: 'departement',
});
EcritureRepartition.belongsTo(Compte, {
  as: 'compteDestination',
  foreignKey: 'compte',
});
DetailsEcriture.belongsTo(EcritureTresorerie, {
  as: 'ecritureTresorerie',
  foreignKey: 'detailEcriture',
});
EcritureTresorerie.belongsTo(TauxDeChange, {
  as: 'tauxDeChange',
  foreignKey: 'taux',
});
DetailsEcriture.belongsTo(Ecriture, { as: 'detail', foreignKey: 'ecriture' });
Ecriture.belongsTo(TauxDeChange, { as: 'tauxDeChange', foreignKey: 'taux' });
Ecriture.belongsTo(Document, { as: 'piece', foreignKey: 'document' });
Ecriture.hasMany(EcritureRepartition, {
  as: 'ecrituresRepartitions',
  foreignKey: 'ecriture',
});

export const setupEcritureEndpoint = (finale: any) => {
  const ecritures = finale.resource({
    model: Ecriture,
    associations: true,
    pagination: false,
    endpoint: ['/ecritures', '/ecritures/:id'],
    search: [
      {
        operator: Sequelize.Op.between,
        param: 'dateRange',
        attributes: ['date'],
      },
      {
        operator: Sequelize.Op.gt,
        param: 'threshold',
        attributes: ['montant'],
      },
      {
        operator: Sequelize.Op.gt,
        param: 'ecartSuperieurA',
        attributes: ['ecart'],
      },
      {
        operator: Sequelize.Op.eq,
        param: 'ecartEgalA',
        attributes: ['ecart'],
      },
    ],
  });
  ecritures.all.auth(authMiddleware);
  ecritures.list.fetch.before(
    async (req: Request, resp: Response, context: any) => {
      if (req.query.year && req.query.departement) {
        const departementId = req.query.departement;
        const year = req.query.year;
        const positiveEcritures = await Ecriture.findAll({
          attributes: {
            exclude: [
              'id',
              'libele',
              'montant',
              'ecart',
              'date',
              'devise',
              'createdAt',
              'updatedAt',
              'document',
              'departement',
              'taux',
            ],
            include: [
              [sequelize.fn('sum', sequelize.col('montant')), 'montantTotal'],
              [sequelize.fn('MONTH', sequelize.col('date')), 'mois'],
            ],
          },
          where: {
            date: {
              [Sequelize.Op.between]: [
                `${year}-1-1 00:00:00`,
                `${year}-12-31 23:00:00`,
              ],
            },
            departement: departementId,
            montant: {
              [Sequelize.Op.gt]: 0
            }
          },
          group: [sequelize.fn('MONTH', sequelize.col('date'))]
        });

        const negativeEcritures = await Ecriture.findAll({
          attributes: {
            exclude: [
              'id',
              'libele',
              'montant',
              'ecart',
              'date',
              'devise',
              'createdAt',
              'updatedAt',
              'document',
              'departement',
              'taux',
            ],
            include: [
              [sequelize.fn('sum', sequelize.col('montant')), 'montantTotal'],
              [sequelize.fn('MONTH', sequelize.col('date')), 'mois'],
            ],
          },
          where: {
            date: {
              [Sequelize.Op.between]: [
                `${year}-1-1 00:00:00`,
                `${year}-12-31 23:00:00`,
              ],
            },
            departement: departementId,
            montant: {
              [Sequelize.Op.lt]: 0
            }
          },
          group: [sequelize.fn('MONTH', sequelize.col('date'))]
        });

        resp.send(positiveEcritures.map((entry: any) => {
          return { ...entry.dataValues, totalDepenses: negativeEcritures.find((ecriture: any) => ecriture.dataValues.mois === entry.dataValues.mois)?.dataValues.montantTotal || 0 };
        }));
        return context.skip();
      }
      return context.continue();
    }
  );

  const ecrituresTresorerie = finale.resource({
    model: EcritureTresorerie,
    associations: true,
    pagination: false,
    endpoints: ['/tresorerie/ecritures', '/tresorerie/ecritures/:id'],
    search: [
      {
        operator: Sequelize.Op.between,
        param: 'dateRange',
        attributes: ['date'],
      },
    ],
  });
  ecrituresTresorerie.all.auth(authMiddleware);
  ecrituresTresorerie.create.write.before(
    async (req: Request, res: Response, context: any) => {
      if (!req.body?.date || !req.body?.departement) {
        return context.continue;
      }
      const date = new Date(req.body?.date);

      const sum = await Ecriture.sum('montant', {
        where: {
          date: {
            [Sequelize.Op.between]: [
              `${date.getFullYear()}-${
                date.getMonth() + 1
              }-${date.getDate()} 00:00`,
              `${date.getFullYear()}-${
                date.getMonth() + 1
              }-${date.getDate()} 23:00`,
            ],
          },
          departement: req.body.departement,
        },
      });
      req.body.montantSysteme = sum;
      context.attributes.montantSysteme = sum;
      return context.continue;
    }
  );

  const ecritureRepartition = finale.resource({
    model: EcritureRepartition,
    associations: true,
    pagination: false,
    endpoints: ['/repartitions/ecritures', '/repartitions/ecritures/:id'],
    search: [
      {
        operator: Sequelize.Op.between,
        param: 'dateRange',
        attributes: ['date'],
      },
    ],
  });
  ecritureRepartition.all.auth(authMiddleware);
};
