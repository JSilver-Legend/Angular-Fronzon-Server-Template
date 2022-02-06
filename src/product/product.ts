import { Sequelize, sequelize } from '../const';

export const SupplierModel = sequelize.define('supplier', {
  nom: { type: Sequelize.STRING },
  addrese: { type: Sequelize.STRING },
});

export const ProductModel = sequelize.define('product', {
  code: { type: Sequelize.STRING, allowNull: false, unique: true },
  designation: { type: Sequelize.STRING, allowNull: false },
  model: { type: Sequelize.STRING },
  marque: { type: Sequelize.STRING },
  fabriquant: { type: Sequelize.STRING },
  serie: { type: Sequelize.STRING },
  conditionnement: { type: Sequelize.ENUM('BOITE', 'CARTON', 'PIECE') },
  quantiteConditionnement: { type: Sequelize.INTEGER },
});
SupplierModel.hasMany(ProductModel);
