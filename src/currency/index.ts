import { authMiddleware } from '../auth';
import { Sequelize } from '../const';
import { Devise, TauxDeChange } from './currency';

export * from './currency';

export const setupCurrencyEndpoint = (finale: any) => {
  const devises = finale.resource({
    model: Devise,
    associations: true,
    pagination: false,
    endpoints: ['/devises', '/devises/:code'],
  });
  devises.all.auth(authMiddleware);

  const tauxDeChange = finale.resource({
    model: TauxDeChange,
    endpoints: ['/taux', '/taux/:id'],
    search: [
      {
        operator: Sequelize.Op.lte,
        param: 'lowerDateBound',
        attributes: ['date'],
      },
    ],
  });
  tauxDeChange.all.auth(authMiddleware);
};
