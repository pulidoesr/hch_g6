// models/Order.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize.js';

export class Order extends Model {}
Order.init(
  {
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), allowNull: false }, // e.g. "USD"
    stripeSessionId: { field: 'stripe_session_id', type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
  },
  { sequelize, modelName: 'order', tableName: 'orders', underscored: true, timestamps: true }
);
