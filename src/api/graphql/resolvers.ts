const startedAt = Date.now();

export const resolvers = {
  Query: {
    health: () => ({
      status: "healthy",
      uptime: (Date.now() - startedAt) / 1000,
    }),
  },
};