import { Request, Response, response } from 'express';
import { authMiddleware } from '../auth';
import { Sequelize, sequelize } from '../const';
import { TauxDeChange } from '../currency';
import { Patient } from '../healthcare';
import { Medecin } from '../healthcare/medecin';
import { User } from '../user';
import { Departement, EquationRepartition } from './compte';
import { recalculateOp } from './recalculate';

export const Document = sequelize.define(
  'document',
  {
    type: { type: Sequelize.ENUM('BON', 'FACTURE'), allowNull: false },
    gratuit: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    valide: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    date: { type: Sequelize.DATE, allowNull: false },
  },
  { freezeTableName: true }
);
Departement.hasMany(Document, { as: 'documents', foreignKey: 'departement' });
User.hasMany(Document, { as: 'documents', foreignKey: 'operateur' });
Patient.hasMany(Document, { as: 'factures', foreignKey: 'patient' });
Document.belongsTo(Patient, { as: 'client', foreignKey: 'patient' });
Document.belongsTo(User, { as: 'emisPar', foreignKey: 'operateur' });
Document.belongsTo(Departement, {
  as: 'departementOrigine',
  foreignKey: 'departement',
});
Medecin.hasMany(Document, { as: 'bons', foreignKey: 'medecin' });

export const setupDocumentEndpoint = (finale: any) => {
  const documents = finale.resource({
    model: Document,
    associations: true,
    search: [
      {
        operator: Sequelize.Op.between,
        param: 'dateRange',
        attributes: ['date'],
      },
    ],
    endpoint: ['/documents', '/documents/:id'],
  });
  documents.all.auth(authMiddleware);
  documents.create.write.after(
    async (req: Request, res: Response, context: any) => {
      const ecritures = context.instance.dataValues.lignes.map(
        (ecriture: any) => ecriture.dataValues
      );
      const departementId = context.instance.dataValues.departement;
      const departement = await Departement.findAll({
        where: {
          id: departementId,
        },
        limit: 1,
        include: [{ model: EquationRepartition, as: 'equationsRepartitions' }],
        order: [
          [
            { model: EquationRepartition, as: 'equationsRepartitions' },
            'date',
            'DESC',
          ],
        ],
      });
      const equationRepartition =
        departement[0].dataValues?.equationsRepartitions[0]?.dataValues;
      if (equationRepartition) {
        await recalculateOp(ecritures, equationRepartition);
      }
      return context.continue;
    }
  );
};
