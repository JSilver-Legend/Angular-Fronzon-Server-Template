import { sequelize, setupFinaleRest, StatusCodes } from './const';
import express = require('express');
import bodyParser = require('body-parser');
import { authenticate } from './auth';
import { recalculateEcrituresRepartitions } from './account';
import {
  getIncomeStats,
  getIncomeVsOutcomeStats,
  getLaboratoryLossStats,
  getTimelineStats,
} from './stats';
import { getConsultationsCount } from './healthcare';
import { ready } from './config/store';
import { tryExecuteFirstInstallProcess } from './config';

const cors = require('cors');
const http = require('http');
const finale = require('finale-rest');
const cookieParser = require('cookie-parser');

const app: express.Application = express();
const DEFAULT_SERVICE_PORT = 8086;
const SERVICE_PORT = process.env.PORT || DEFAULT_SERVICE_PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser('signed'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static('dist/frozen-iguan'));

setupFinaleRest(finale, app);

sequelize.sync({ alter: true })
  .catch((e: any) => console.error(`The error is ${e}`))
  .then(async () => {
    const isAppReady = await ready;
    if (!isAppReady) return;

    tryExecuteFirstInstallProcess();
    
    http
      .createServer(app)
      .listen(SERVICE_PORT, () =>
        console.warn(`[INFO] HTTP Server running on port ${SERVICE_PORT}`)
      );
    app.post('/auth/login', authenticate);
    app.get('/ping', (req: express.Request, resp: express.Response) =>
      resp.status(StatusCodes.Ok).json({ status: 'up' })
    );
    app.post('/recalculate', recalculateEcrituresRepartitions);
    app.get('/stats/timeline', getTimelineStats);
    app.get('/stats/income', getIncomeStats);
    app.get('/stats/invsout', getIncomeVsOutcomeStats);
    app.get('/stats/labovsloss', getLaboratoryLossStats);
    app.get('/stats/consultations/count', getConsultationsCount);
  });
