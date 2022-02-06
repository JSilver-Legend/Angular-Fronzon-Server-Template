import { Request, Response } from 'express';
import {
  Departement,
  Document,
  Ecriture,
  EcritureTresorerie,
} from '../account';
import { Sequelize } from '../const';

export const getLaboratoryLossStats = async (req: Request, resp: Response) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDayOfMonth = getLastDayOfMonth(year, month);
  const departments = await Departement.findAll({
    where: {
      intitule: 'LABORATOIRE',
    },
  });
  const series = [];

  for (const departement of departments) {
    const nonFreeDocuments = await Document.findAll({
      where: {
        departement: departement.id,
        gratuit: false,
        type: 'FACTURE',
        date: {
          [Sequelize.Op.between]: [
            `${year}-${month}-1 00:00:00`,
            `${year}-${month}-${lastDayOfMonth} 23:00:00`,
          ],
        },
      },
      include: [{ model: Ecriture, as: 'lignes' }],
    });
    const freeDocuments = await Document.findAll({
      where: {
        departement: departement.id,
        gratuit: true,
        type: 'FACTURE',
        date: {
          [Sequelize.Op.between]: [
            `${year}-${month}-1 00:00:00`,
            `${year}-${month}-${lastDayOfMonth} 23:00:00`,
          ],
        },
      },
      include: [{ model: Ecriture, as: 'lignes' }],
    });

    const freeEntriesSum = freeDocuments
      .map((d: any) => {
        if (d.dataValues.lignes.length === 0) {
          return 0;
        }
        return d.dataValues.lignes
          .map((l: any) => l.dataValues.montant)
          .reduce((previous: number, current: number) => previous + current);
      })
      .reduce((previous: number, current: number) => previous + current);

    const nonFreeEntriesSum = nonFreeDocuments
      .map((d: any) => {
        if (d.dataValues.lignes.length === 0) {
          return 0;
        }
        return d.dataValues.lignes
          .map((l: any) => l.dataValues.montant)
          .reduce((previous: number, current: number) => previous + current);
      })
      .reduce((previous: number, current: number) => previous + current);

    series.push(
      {
        name: 'Recettes',
        value: nonFreeEntriesSum,
      },
      {
        name: 'Manque à gagner',
        value: freeEntriesSum,
      }
    );
  }

  resp.send(series);
};

export const getTimelineStats = async (req: Request, res: Response) => {
  const departments = await Departement.findAll({});
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const currentDay = date.getDate();
  const stats: any[] = [];

  for (const departement of departments) {
    const series = [];
    let totalSum = 0;

    for (let day = 1; day <= currentDay; day++) {
      const dailySum = await Ecriture.sum('montant', {
        where: {
          date: {
            [Sequelize.Op.between]: [
              `${year}-${month}-${day} 00:00`,
              `${year}-${month}-${day} 23:00`,
            ],
          },
          departement: departement.id,
        },
      });
      series.push({
        name: `${day}/${month}`,
        value: dailySum,
      });
      totalSum += dailySum;
    }

    if (totalSum > 0) {
      stats.push({
        name: departement.label,
        series: series,
      });
    }
    totalSum = 0;
  }

  res.send(stats);
};

export const getIncomeStats = async (req: Request, resp: Response) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDayOfMonth = getLastDayOfMonth(year, month);
  const departments = await Departement.findAll({});
  const series = [];

  for (const departement of departments) {
    const sum = await Ecriture.sum('montant', {
      where: {
        departement: departement.id,
        date: {
          [Sequelize.Op.between]: [
            `${year}-${month}-1 00:00`,
            `${year}-${month}-${lastDayOfMonth} 23:00`,
          ],
        },
      },
    });
    series.push({
      name: departement.label,
      value: sum,
    });
  }

  resp.send(series.filter((s: any) => s.value > 0));
};

const getLastDayOfMonth = (year: number, month: number) => {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 2:
      const yearsSince2020 = year - 2020;
      return yearsSince2020 % 4 == 0 ? 29 : 28;
    default:
      return 30;
  }
};

export const getIncomeVsOutcomeStats = async (req: Request, resp: Response) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const positiveSeries = [];
  const negativeSeries = [];

  for (let day = 1; day <= date.getDate(); day++) {
    const dailyPositiveSum = await Ecriture.sum('montant', {
      where: {
        date: {
          [Sequelize.Op.between]: [
            `${year}-${month}-${day} 00:00`,
            `${year}-${month}-${day} 23:00`,
          ],
        },
        montant: { [Sequelize.Op.gt]: 0 },
      },
    });
    const dailyNevagtiveSum = await Ecriture.sum('montant', {
      where: {
        date: {
          [Sequelize.Op.between]: [
            `${year}-${month}-${day} 00:00`,
            `${year}-${month}-${day} 23:00`,
          ],
        },
        montant: { [Sequelize.Op.lt]: 0 },
      },
    });
    const dailyTresorerieNegativeSum = await EcritureTresorerie.sum('montant', {
      where: {
        date: {
          [Sequelize.Op.between]: [
            `${year}-${month}-${day} 00:00`,
            `${year}-${month}-${day} 23:00`,
          ],
        },
        montant: { [Sequelize.Op.lt]: 0 },
      },
    });

    positiveSeries.push({
      name: `${day}/${month}`,
      value: dailyPositiveSum,
    });
    negativeSeries.push({
      name: `${day}/${month}`,
      value: (dailyNevagtiveSum + dailyTresorerieNegativeSum) * -1,
    });
  }
  resp.send([
    { name: 'Entrées', series: positiveSeries },
    { name: 'Sorties', series: negativeSeries },
  ]);
};
