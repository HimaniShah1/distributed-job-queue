import { seedJobs } from "./helpers/seed-jobs";

const main = async (): Promise<void> => {
  await seedJobs(
    Array.from({ length: 10 }, () => ({
      processingTimeMs: 5000,
      shouldFail: false,
    }))
  );

  console.log("Jobs seeded.");
};

void main();