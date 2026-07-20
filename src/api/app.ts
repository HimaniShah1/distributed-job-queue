import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";

import { registerGraphQL } from "./plugins/graphql";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: "http://localhost:5173",
  });

  await registerGraphQL(app);

  return app;
};