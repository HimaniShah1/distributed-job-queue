import { dashboardService } from "../services/dashboard.service";

const startedAt = Date.now();

export const resolvers = {
  Query: {
    health: () => ({
      status: "healthy",
      uptime: (Date.now() - startedAt) / 1000,
    }),

    dashboardStats: async () => {
      return dashboardService.getDashboardStats();
    },
  },
};