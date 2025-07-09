import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vedantbahdure:Vedant123@cluster0.wqjw0.mongodb.net/medifind";

let cachedConnection: mongoose.Connection | null = null;

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);
    
    const connection = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    cachedConnection = connection.connection;
    
    // Handle connection events
    cachedConnection.on('connected', () => {
      console.log('Connected to MongoDB');
    });
    
    cachedConnection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    cachedConnection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });
    
    return cachedConnection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    cachedConnection = null;
    throw error;
  }
}

// Function to check if database is connected
export function isConnected(): boolean {
  return cachedConnection?.readyState === 1;
}

// Function to disconnect from database
export async function disconnectFromDatabase() {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
}