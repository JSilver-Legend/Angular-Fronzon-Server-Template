import { authMiddleware } from '../auth';
import { Sequelize } from '../const';
import { Consultation } from './consultation';
import { Patient } from './patient';

export * from './patient';
export * from './consultation';

export const setupPatientResource = (finale: any) => {
  const patients = finale.resource({
    model: Patient,
    endpoints: ['/patients', 'patients/:id'],
    pagination: false,
    search: [
      {
        operator: Sequelize.Op.LIKE,
        param: 'searchedName',
        attributes: ['nom'],
      },
      {
        operator: Sequelize.Op.LIKE,
        param: 'searchedFirstName',
        attributes: ['prenom'],
      },
      {
        opeartor: Sequelize.Op.LIKE,
        param: 'searchedLastName',
        attributes: ['postnom'],
      },
    ],
  });
  patients.all.auth(authMiddleware);
};
