import Fastify, {
  type FastifyInstance,
} from "fastify";

import { registerGraphQL } from "./plugins/graphql";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  await registerGraphQL(app);

  return app;
};