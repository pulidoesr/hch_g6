// models/OrderItem.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize.js';

export class OrderItem extends Model {}
OrderItem.init(
  {
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  },
  { sequelize, modelName: 'order_item', tableName: 'order_items', underscored: true, timestamps: true }
);
