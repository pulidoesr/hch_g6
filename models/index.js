// models/index.js
import { sequelize } from '../lib/sequelize.js';
import createUser from './User.js';
import createProduct from './Product.js';
import createOrder from './Order.js';
import createOrderItem from './OrderItem.js';

let db = globalThis.__db; 

if (!db) {
  const User = createUser(sequelize);
  const Product = createProduct(sequelize);
  const Order = createOrder(sequelize);
  const OrderItem = createOrderItem(sequelize);

  // Associations
  User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'lineItems' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  db = { sequelize, User, Product, Order, OrderItem };

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__db = db;
  }
}

export default db;
