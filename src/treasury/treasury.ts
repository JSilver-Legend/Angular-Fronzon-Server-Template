import { sequelize, Sequelize } from '../const';
import { Devise } from '../currency';

const VARCHAR_LENGTH_5 = 5;

export const TreasuryAccountModel = sequelize.define('treasuryAccount', {
  intitule: { type: Sequelize.STRING, allowNull: false },
  code: {
    type: Sequelize.STRING(VARCHAR_LENGTH_5),
    allowNull: false,
    primaryKey: true,
  },
  shared: { type: Sequelize.BOOLEAN, defaultValue: false },
});

export const TreasuryEntryModel = sequelize.define('treasuryEntry', {
  montant: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  montantSysteme: { type: Sequelize.INTEGER, allowNull: false },
  date: { type: Sequelize.DATE, allowNull: false },
  libele: { type: Sequelize.STRING, allowNull: false },
  type: { type: Sequelize.ENUM('ENTREE', 'SORTIE'), allowNull: false },
  approuve: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  originalId: { type: Sequelize.INTEGER },
  devise: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: Devise,
      key: 'code',
    },
  },
  compte: {
    type: Sequelize.STRING(VARCHAR_LENGTH_5),
    references: {
      model: TreasuryAccountModel,
      key: 'code',
    },
  },
});
