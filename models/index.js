// models/index.js
import { sequelize } from '../lib/sequelize.js';
import { User } from './User.js';
import { Product } from './Product.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';

// Order belongs to a Buyer (User)
User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

// Order has many Items
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Optional: link order_items to products
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'lineItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export { sequelize, User, Product, Order, OrderItem };
