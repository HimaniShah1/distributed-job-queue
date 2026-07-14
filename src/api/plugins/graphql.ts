import mercurius from "mercurius";
import type { FastifyInstance } from "fastify";

import { context } from "../graphql/context.js";
import { resolvers } from "../graphql/resolvers.js";
import { schema } from "../graphql/schema.js";

export const registerGraphQL = async (
  app: FastifyInstance,
): Promise<void> => {
  await app.register(mercurius, {
    schema,
    resolvers,
    context,
    graphiql: true,
  });
};