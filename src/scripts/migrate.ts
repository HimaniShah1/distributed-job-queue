import { readdir, readFile } from "fs/promises";
import path from "path";
import { pool } from "../db/pool";
import { logger } from "../logger/logger";


/** TO TRACK MIGRATIONS */

const ensureMigrationsTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      migration_name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

/** ALL THE FILES FROM THE MIGRATIONS FOLDER */

const getMigrationFiles = async (): Promise<string[]> => {
  const migrationsDir = path.resolve(
    process.cwd(),
    "sql",
    "migrations"
  );

  const files = await readdir(migrationsDir);

  return files.sort();
};

/** FILES ALREADY EXECUTED - FROM THE table schema_migrations*/

const getExecutedMigrations = async (): Promise<Set<string>> => {
  const result = await pool.query(`
    SELECT migration_name
    FROM schema_migrations
  `);

 return new Set(
    result.rows.map(
      (row: { migration_name: string }) =>
        row.migration_name
    )
  );
};

const runPendingMigrations = async (
  pendingMigrations: string[]
): Promise<void> => {
  const migrationsDir = path.resolve(
    process.cwd(),
    "sql",
    "migrations"
  );

  for (const migration of pendingMigrations) {
    const migrationPath = path.resolve(
      migrationsDir,
      migration
    );

    const sql = await readFile(
      migrationPath,
      "utf-8"
    );

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(sql);

      await client.query(
        `
          INSERT INTO schema_migrations (
            migration_name
          )
          VALUES ($1)
        `,
        [migration]
      );

      await client.query("COMMIT");

      logger.info(
        { migration },
        "Migration executed successfully"
      );
    } catch (error) {
      await client.query("ROLLBACK");

      logger.error(
        {
          migration,
          error,
        },
        "Migration failed"
      );

      throw error;
    } finally {
      client.release();
    }
  }
};

const main = async (): Promise<void> => {
  try {
    await ensureMigrationsTable();

    const migrationFiles =
      await getMigrationFiles();

    const executedMigrations =
      await getExecutedMigrations();

    const pendingMigrations =
      migrationFiles.filter(
        (file) =>
          !executedMigrations.has(file)
      );

    if (pendingMigrations.length === 0) {
      logger.info(
        "No pending migrations found"
      );

      return;
    }

    await runPendingMigrations(
      pendingMigrations
    );

    logger.info(
      {
        count: pendingMigrations.length,
      },
      "Migration run completed"
    );
  } catch (error) {
    logger.error(
      { error },
      "Migration process failed"
    );

    process.exit(1);
  } finally {
    await pool.end();
  }
};

void main();