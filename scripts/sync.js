// scripts/sync.js
import db from '../models/index.js';

try {
  await db.sequelize.authenticate();
  await db.sequelize.sync({ alter: true }); // dev only; use migrations in prod
  console.log('Synced ✅');
} catch (e) {
  console.error(e);
} finally {
  process.exit(0);
}
