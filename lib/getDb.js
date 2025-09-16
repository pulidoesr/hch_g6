// lib/getDb.js
import { withConnection } from './sequelize.js';
import db from '../models/index.js';

export async function getDb() {
  await withConnection(); 
  return db;
}
