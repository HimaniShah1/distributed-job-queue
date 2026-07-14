import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const start = async (): Promise<void> => {
  try {
    const app = await buildApp();

    await app.listen({
      port: PORT,
      host: HOST,
    });

    app.log.info(
      `🚀 Queue API running at http://${HOST}:${PORT}`,
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void start();