import { userInfo } from 'os';
import { Sequelize, sequelize } from '../const/sequelize';

export interface Role {
  id: number;
  utilisateur: string;
  label?: string;
}

export interface User {
  nom: string;
  postnom: string;
  prenom: string;
  identifiant: string;
  roles?: Role[];
  departements?: any[];
}

export interface Shadow {
  utilisateur?: string;
  password?: string;
  migrated?: boolean;
}

export const User = sequelize.define(
  'utilisateur',
  {
    nom: { type: Sequelize.STRING },
    postnom: { type: Sequelize.STRING },
    prenom: { type: Sequelize.STRING },
    identifiant: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export const ShadowModel = sequelize.define(
  'shadow',
  {
    utilisateur: {
      type: Sequelize.STRING,
      references: {
        model: User,
        key: 'identifiant',
      },
      allowNull: false,
      unique: true,
    },
    password: { type: Sequelize.STRING },
    migrated: { type: Sequelize.BOOLEAN, defaultValue: false },
  },
  {
    freezeTableName: true,
  }
);
ShadowModel.belongsTo(User, { as: 'credentials' });

export const RoleModel = sequelize.define('role', {
  label: { type: Sequelize.STRING, allowNull: false },
});
User.hasMany(RoleModel, { as: 'roles', foreignKey: 'utilisateur' });
User.hasMany(ShadowModel, { as: 'credentials', foreignKey: 'utilisateur' });
