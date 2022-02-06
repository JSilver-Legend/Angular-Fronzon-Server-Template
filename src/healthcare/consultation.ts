import { Request, Response } from "express";
import { Sequelize, sequelize } from "../const";
import { Medecin } from "./medecin";
import { Patient } from "./patient";
import _ from 'lodash';
import { Departement } from "../account";

export const ProcessusConsultation = sequelize.define('processus_consultation',
{
  schema: { type: Sequelize.STRING, allowNull: false }
},
{
  freezeTableName: true
});

export const Consultation = sequelize.define(
  'consultation', {
    notes: { type: Sequelize.TEXT, allowNull: false },
    description: { type: Sequelize.STRING, allowNull: false },
    date: { type: Sequelize.DATE, allowNull: false },
    status: { type: Sequelize.ENUM('CLOTUREE', 'EN_COURS', 'NURSING', 'REDIRIGEE', 'EN_ATTENTE')}
  }
);

export const PriseSignesVitaux = sequelize.define(
  'vital_sign',
  {
    symptomes: { type: Sequelize.STRING },
    tension: { type: Sequelize.STRING },
    poids: { type: Sequelize.DOUBLE },
    temperature: { type: Sequelize.DOUBLE },
    imc: { type: Sequelize.STRING },
    date: { type: Sequelize.DATE },
    stage: { type: Sequelize.STRING },
  }
);


Patient.hasMany(Consultation, { as: 'Consultations', foreignKey: 'patientId' });
Consultation.belongsTo(Patient, { as: 'Client', foreignKey: 'patientId' });
Medecin.hasMany(Consultation, { as: 'Consultations', foreinKey: { name: 'medecinId', allowNull: true }});
Consultation.belongsTo(Medecin, { as: 'Medecin', foreignKey: { name: 'medecinId', allowNull: true }});
PriseSignesVitaux.belongsTo(Consultation, { as: 'Consultation', foreignKey: 'consultationId'});
Departement.hasMany(Consultation, { as: 'Consultations', foreignKey: 'departementId'});

export const setupConsultationResource = (finale: any) => {
  const consultations = finale.resource({
    model: Consultation,
    associations: true,
    pagination: true,
    endpoints: ['/consultations', '/consultations/:id'],
    search: [
      {
        operator: Sequelize.Op.eq,
        param: 'filter',
        attributes: ['status'],
      },
      {
        operator: Sequelize.Op.in,
        param: 'filters',
        attributes: ['status'],
      }
    ],
  });
};

export const setupVitalSignsResource = (finale: any) => {
  const resource = finale.resource({
    model: PriseSignesVitaux,
    associations: true,
    pagination: true,
    endpoints: ['/signes_vitaux']
  });

  resource.create.write.after((req: Request, res: Response, context: any) => { 
    const vitalSigns = req.body;
    sequelize.query(`UPDATE consultations set status='EN_ATTENTE' WHERE id=${vitalSigns.consultationId}`);

    return context.continue;
  });
}

export const getConsultationsCount = async (req: Request, resp: Response) => {
  let count = 0;

  console.warn(req.query);
  if (req.query.status) {
    count = await Consultation.count({
      where: {
        status: req.query.status
      }
    });
  } else {
    count = await Consultation.count();
  }

  resp.json({ count }).end();
}
