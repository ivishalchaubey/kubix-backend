import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000"),
  mongoose: {
    url:
      process.env.MONGODB_URI ||
      "mongodb+srv://vishalchaubey0011:tyVQdc92r1i1uzZi@cluster0.zajfs.mongodb.net/",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "jwt_kubix_backend",
    accessExpirationMinutes: process.env.JWT_EXPIRE || "7d",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "jwt_kubix_backend_refresh",
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRE || "30d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  },
  email: {
    from: process.env.EMAIL_FROM,
    smtp: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  payment: {
    tokenRate: 10, // 1 USD = 10 tokens
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default config;
