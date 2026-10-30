import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import Product from './models/Product.js';
import { seedDatabase } from './utils/seeder.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Check if database needs initial seeding
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Server] Database is empty. Seeding initial categories, products, and admin user...');
      await seedDatabase(false);
    }
  } catch (seedErr) {
    console.warn('[Server] Auto-seed check warning:', seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  ShopSphere REST API is running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      await closeDB();
      console.log('[Server] Connections closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
