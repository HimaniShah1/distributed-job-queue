import { Client } from "pg";

const CHANNEL_NAME = "jobs_channel";

let listener: Client | null = null;

/** Dedicated connection because LISTEN is tied to a single PostgreSQL session */
export const initializeListener = async (): Promise<void> => {
  if (listener) {
    return;
  }

  listener = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await listener.connect();

  /** Start listening for newly created jobs */
  await listener.query(`LISTEN ${CHANNEL_NAME}`);
};

/** Worker sleeps here until Postgres wakes it up */
export const waitForNotification = async (): Promise<void> => {
  if (!listener) {
    throw new Error("Listener has not been initialized.");
  }

  const client = listener;

  await new Promise<void>((resolve) => {
    const onNotification = (): void => {
      client.off("notification", onNotification);

      resolve();
    };

    client.on("notification", onNotification);
  });
};