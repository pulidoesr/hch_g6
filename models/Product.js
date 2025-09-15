// models/Product.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize.js';

export class Product extends Model {}
Product.init(
  {
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  },
  { sequelize, modelName: 'product', tableName: 'products', underscored: true, timestamps: true }
);
