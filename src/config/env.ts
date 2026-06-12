import dotenv from "dotenv";

dotenv.config();

const { DATABASE_URL, LOG_LEVEL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const config = {
  databaseUrl: DATABASE_URL,
  logLevel: LOG_LEVEL ?? "info",
} as const;