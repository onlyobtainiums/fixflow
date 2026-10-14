import {z} from 'zod';
const schema=z.object({DATABASE_URL:z.string().url(),FIREBASE_PROJECT_ID:z.string().min(1),FIREBASE_CLIENT_EMAIL:z.string().email(),FIREBASE_PRIVATE_KEY:z.string().min(20),CLOUDINARY_CLOUD_NAME:z.string().min(1),CLOUDINARY_API_KEY:z.string().min(1),CLOUDINARY_API_SECRET:z.string().min(1),PAYSTACK_SECRET_KEY:z.string().min(1),APP_URL:z.string().url(),CSRF_SECRET:z.string().min(32)});
export const checkEnv=()=>schema.safeParse(process.env);
