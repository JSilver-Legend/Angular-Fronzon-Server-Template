import { Request, Response } from 'express';
import { Sequelize, StatusCodes } from '../const';
import { TauxDeChange } from '../currency';
import { Compte, EtatCompte } from './compte';
import { Ecriture, EcritureRepartition } from './ecriture';

interface ITauxDeChange {
  id: number;
  de: string;
  vers: string;
  taux: number;
  date: Date;
}

interface IEcriture {
  id: number;
  libele: string;
  montant: number;
  date: Date;
  devise: string;
  departement: number;
  details: number;
  taux: number;
  tauxDeChange: ITauxDeChange;
  detail: any;
  piece: Document;
  ecrituresRepartitions: any[];
}

interface IEquationRepartition {
  id: number;
  script: string;
  formatAffichable: string;
  date: Date;
  comptes: string;
}

interface ICompte {
  id: number;
  intitule: string;
  balance: number;
  code: string;
}

interface IEtatCompte {
  id: number;
  idCompte: number;
  annee: number;
  mois: number;
  solde: number;
}

interface IConditional {
  type: string;
  value: any;
}

export const recalculateEcrituresRepartitions = async (
  req: Request,
  resp: Response
) => {
  const departement = req.body.id;
  const equation = req.body.equation as IEquationRepartition;
  const dateRange: string[] = req.query.dateRange as string[];

  if (!departement || !equation || !dateRange) {
    return resp.sendStatus(StatusCodes.BadRequest);
  }

  const ecrituresResults = await Ecriture.findAll({
    where: {
      date: {
        [Sequelize.Op.between]: dateRange,
      },
      ecart: {
        [Sequelize.Op.eq]: 0,
      },
      departement,
    },
    include: [
      {
        model: EcritureRepartition,
        as: 'ecrituresRepartitions',
      },
      { model: TauxDeChange, as: 'tauxDeChange' },
    ],
  });

  if (!ecrituresResults) {
    return resp.sendStatus(404);
  }

  if (ecrituresResults.length === 0) {
    return resp.sendStatus(StatusCodes.NotFound);
  }

  const ecritures = ecrituresResults.map(
    (e: any) => e.dataValues
  ) as IEcriture[];

  ecritures.forEach(async (ecriture: any) => {
    if (
      ecriture.ecrituresRepartitions &&
      ecriture.ecrituresRepartitions.length > 0
    ) {
      await EcritureRepartition.destroy({
        where: {
          id: {
            [Sequelize.Op.in]: ecriture.ecrituresRepartitions
              .map((er: any) => er.dataValues)
              .map((dv: any) => dv.id),
          },
        },
      });
    }
  });

  recalculateOp(ecritures, equation, resp);
};

const execRepartitionScriptOnEcriture = async (
  ecriture: IEcriture,
  script: string,
  comptes: ICompte[]
) => {
  let steps: string[] = [];
  if (script.includes('conditionalRatio')) {
    const conditionalStartIndex = script.indexOf('conditionalRatio');
    const conditionalLastIndex = script.indexOf('}');
    const conditionalPath = script.substr(
      conditionalStartIndex,
      conditionalLastIndex - conditionalStartIndex
    );

    const alternativeStartIndex = script.indexOf('else');
    const alternativeEndIndex = script.lastIndexOf('}');
    const alternativePath = script.substr(
      alternativeStartIndex,
      alternativeEndIndex - alternativeStartIndex
    );

    const conditionalStrStartIndex = conditionalPath.indexOf('{ ');
    const conditionalStrEndIndex = conditionalPath.indexOf('}');
    const conditionalStr = conditionalPath
      .substr(
        conditionalStrStartIndex,
        conditionalStrEndIndex - conditionalStrStartIndex
      )
      .replace('field:', '"field":')
      .replace('value:', '"value":');
    const conditional = JSON.parse(conditionalStr) as IConditional;
    let stepsStr = '';

    if (
      ((ecriture as any)[conditional.type] &&
        (ecriture as any)[conditional.type] === conditional.value) ||
      ((ecriture.detail as any)[conditional.type] &&
        (ecriture.detail as any)[conditional.type] === conditional.value)
    ) {
      const conditionalPathStartIndex = conditionalPath.indexOf('}){') + 1;
      const conditionalPathEndIndex = conditionalPath.indexOf(';}else') - 1;
      stepsStr = conditionalPath.substr(
        conditionalPathStartIndex,
        conditionalPathEndIndex - conditionalPathStartIndex
      );
    } else {
      const alternativePathStartIndex = alternativePath.indexOf('{') + 1;
      const alternativePathEndIndex = alternativePath.lastIndexOf('}') - 1;
      stepsStr = alternativePath.substr(
        alternativePathStartIndex,
        alternativePathEndIndex - alternativePathStartIndex
      );
    }

    steps = stepsStr.split(';');
  } else {
    steps = script.split(';');
  }

  if (steps.length === 0) {
    return [];
  }

  const montant =
    ecriture.devise === 'CDF'
      ? ecriture.montant / ecriture.tauxDeChange.taux
      : ecriture.montant;
  let remainder = { value: montant };
  let ecritureRepartitions: any[] = [];
  steps.forEach((step: string) => {
    const ecritureRepartition = execStep(step, ecriture, comptes, remainder);

    if (ecritureRepartition) {
      ecritureRepartitions.push(ecritureRepartition);
    }
  });

  if (ecritureRepartitions.length > 0) {
    const repartitions = await EcritureRepartition.bulkCreate(
      ecritureRepartitions
    );
    return repartitions.map((r: any) => r.dataValues);
  }
  return [];
};

const execStep = (
  step: string,
  ecriture: IEcriture,
  comptes: ICompte[],
  remainder: any
) => {
  if (step.includes('fixed')) {
    const startIndex = step.indexOf('(') + 1;
    const lastIndex = step.indexOf(',');
    const amount = parseFloat(step.substr(startIndex, lastIndex - startIndex));
    const accountStartIndex = step.indexOf('"') + 1;
    const accountEndIndex = step.lastIndexOf('"');
    const account = step.substr(
      accountStartIndex,
      accountEndIndex - accountStartIndex
    );
    remainder.value -= amount;
    return fixed(amount, account, ecriture, comptes);
  } else if (step.includes('ratio')) {
    const startIndex = step.indexOf('(') + 1;
    const lastIndex = step.indexOf(',');
    const amount = parseFloat(step.substr(startIndex, lastIndex - startIndex));
    const accountStartIndex = step.indexOf('"') + 1;
    const accountEndIndex = step.lastIndexOf('"');
    const account = step.substr(
      accountStartIndex,
      accountEndIndex - accountStartIndex
    );
    return ratio(amount, account, ecriture, remainder, comptes);
  }
};

const fixed = (
  amount: number,
  account: string,
  ecriture: IEcriture,
  comptes: ICompte[]
) => {
  return makeEcritureRepartition(amount, account, ecriture, comptes);
};

const makeEcritureRepartition = (
  amount: number,
  account: string,
  ecriture: IEcriture,
  comptes: ICompte[],
  balance?: any
) => {
  const compte = comptes.find((compte: ICompte) => compte.code === account);
  return {
    montant: balance ? (balance.value * amount) / 100 : amount,
    sens: 'ENTREE',
    departement: ecriture.departement,
    compte: compte?.id,
    ecriture: ecriture.id,
    date: ecriture.date,
  };
};

const ratio = (
  value: number,
  account: string,
  ecriture: IEcriture,
  balance: any,
  comptes: ICompte[]
) => {
  return makeEcritureRepartition(value, account, ecriture, comptes, balance);
};

export const recalculateOp = async (
  ecritures: IEcriture[],
  equation: IEquationRepartition,
  resp?: Response
) => {
  const comptesData = await Compte.findAll({});

  if (!comptesData || comptesData.length === 0) {
    return resp?.sendStatus(500); // Change this to something that indicate that the request couldn't be fullfiled because of missing data
  }

  const comptes = comptesData.map((c: any) => c.dataValues);

  const results: any[] = [];
  for (const ecriture of ecritures) {
    const ecritureRepartitions = await execRepartitionScriptOnEcriture(
      ecriture,
      equation.script,
      comptes
    );
    results.push({ ...ecriture, ecrituresRepartitions: ecritureRepartitions });
  }
  return resp?.status(StatusCodes.Ok).send(results);
};
