import { claimJob } from "../jobs/claim-job";

const main = async (): Promise<void> => {
  const job = await claimJob("worker-1");

  console.log(job);
};

void main();