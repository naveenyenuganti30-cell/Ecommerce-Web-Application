import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log(`[Database] Connecting to configured MONGODB_URI...`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`[Database] MongoDB Connected to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
      return conn;
    }

    // Try connecting to default local mongodb
    try {
      console.log(`[Database] Attempting connection to local mongodb://127.0.0.1:27017/shopsphere...`);
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/shopsphere', {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`[Database] Connected to local MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log(`[Database] Local MongoDB unavailable, spinning up in-memory MongoDB server for seamless development/testing...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri, {
        dbName: 'shopsphere'
      });
      console.log(`[Database] In-memory MongoDB running at: ${inMemoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[Database Error] Failed to connect:`, error.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
