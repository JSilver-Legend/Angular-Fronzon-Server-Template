export const Sequelize = require('sequelize');

export const sequelize = new Sequelize('emss', 'tas', 'tas', {
  host: 'localhost',
  port: 3307,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});
