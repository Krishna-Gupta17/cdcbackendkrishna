//configuratuion or setting up the ,mongo, cloudinary,firebase ,multer 

import mongoose from "mongoose";
import dotenv from "dotenv";
import {v2 as cloudinary} from "cloudinary"
import multer from "multer";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();
//---------------------MONGODB--------------------------
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
};

//------------------cloudinary for image uploads-------------------
export const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });
};

export const uploadToCloudinary = async (fileData, options = {}) => {
  try {
    let uploadOptions = {
      folder: options.folder || 'uploads',
      ...options
    };
    if (Buffer.isBuffer(fileData)) {
      const base64String = fileData.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64String}`;
      
      const data = await cloudinary.uploader.upload(dataUri, uploadOptions);
      return { url: data.secure_url, publicID: data.public_id };
    } else if (typeof fileData === 'string') {
      const data = await cloudinary.uploader.upload(fileData, uploadOptions);
      return { url: data.secure_url, publicID: data.public_id };
    } else {
      throw new Error('Invalid file data type. Expected Buffer or string.');
    }
  } catch (error) {
    console.error("Failed to upload to Cloudinary:", error);
    throw error;
  }
};
//-------------------------FIREBASE----------------------
let auth = null;
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  if (!admin.apps.length) { 
    const serviceAccount = JSON.parse(
      readFileSync(join(__dirname, "firebaseServiceAccountKey.json"))
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully !!");
  } else {
    console.log("Firebase Admin SDK already initialized !!");
  }

  auth = admin.auth();
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK !! :", error.message);
}
export { auth };


//--------------------MULTER---------------------
export const upload = multer({
    storage: multer.memoryStorage(),
    limit: { fileSize: 1024 * 1024 * 10 },
});

