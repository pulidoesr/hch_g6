// lib/sequelize.js
import { Sequelize } from 'sequelize';

let _sequelize = globalThis.__sequelize; 

if (!_sequelize) {
  _sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__sequelize = _sequelize;
  }
}

export const sequelize = _sequelize;
export const withConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
  return sequelize;
};
