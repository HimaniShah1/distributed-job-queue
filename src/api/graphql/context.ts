import type { FastifyRequest } from "fastify";

export type GraphQLContext = {
  request: FastifyRequest;
};

export const context = async (
  request: FastifyRequest,
): Promise<GraphQLContext> => {
  return {
    request,
  };
};