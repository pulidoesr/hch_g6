// models/User.js User with roles
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize.js';

export class User extends Model {}
User.init(
  {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    role: { type: DataTypes.ENUM('buyer', 'seller', 'admin'), defaultValue: 'buyer' },
    image: DataTypes.STRING,
    sellerHandle: { type: DataTypes.STRING, unique: true, allowNull: true },
  },
  { sequelize, modelName: 'user', tableName: 'users', underscored: true, timestamps: true }
);