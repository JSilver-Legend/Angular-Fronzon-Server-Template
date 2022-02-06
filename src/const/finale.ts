import {
  setupAccountEndpoint,
  setupDocumentEndpoint,
  setupEcritureEndpoint,
} from '../account';
import { setupCurrencyEndpoint } from '../currency';
import { setupConsultationResource, setupPatientResource, setupVitalSignsResource } from '../healthcare';
import { setupMedecinResouce } from '../healthcare/medecin';
import { setupProductEndpoint } from '../product';
import { setupUserEndpoint } from '../user';
import { sequelize } from './sequelize';

export const setupFinaleRest = (finale: any, app: Express.Application) => {
  finale.initialize({
    app,
    sequelize,
  });

  setupUserEndpoint(finale);
  setupAccountEndpoint(finale);
  setupProductEndpoint(finale);
  setupEcritureEndpoint(finale);
  setupDocumentEndpoint(finale);
  setupMedecinResouce(finale);
  setupCurrencyEndpoint(finale);
  setupPatientResource(finale);
  setupConsultationResource(finale);
  setupVitalSignsResource(finale);
};
