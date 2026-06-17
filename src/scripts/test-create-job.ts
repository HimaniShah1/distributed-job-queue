import { createJob } from "../jobs/create-job";

const main = async (): Promise<void> => {
  const job = await createJob({
    queueName: "emails",
    payload: {
      to: "test@example2.com",
    },
  });

  console.log(job);
};

void main();