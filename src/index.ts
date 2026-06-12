import { pool } from "./db/pool.js";
import { logger } from "./logger/logger.js";

const bootstrap = async (): Promise<void> => {
  try {
    const result = await pool.query("SELECT 1");

    logger.info(
      { result: result.rows[0] },
      "Database connected successfully"
    );
  } catch (error) {
    logger.error({ error }, "Failed to connect to database");

    process.exit(1);
  }
};

void bootstrap();