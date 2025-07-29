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
    url: process.env.MONGO_URI!,
  },
  jwt: {
    secret: "jwt_kubix_backend",
    accessExpirationMinutes: process.env.JWT_EXPIRE || "7d",
    refreshSecret: "jwt_kubix_backend_refresh",
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
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default config;
