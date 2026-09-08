import mongoose from 'mongoose';

/**
 * Establishes MongoDB connection using Mongoose ODM.
 */
export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;

    if (!connUri) {
      console.warn('⚠️ [DB Warning]: MONGODB_URI environment variable is not defined.');
      console.warn('⚠️ [DB Warning]: Database features will be unavailable until MONGODB_URI is configured.');
      return false;
    }

    const conn = await mongoose.connect(connUri);

    console.log(`✅ [MongoDB Connected]: Host -> ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    // Log error cleanly without exposing raw connection string password
    return false;
  }
};
