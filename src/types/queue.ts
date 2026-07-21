export interface QueueStats {
  jobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };

  workers: {
    active: number;
  };
}