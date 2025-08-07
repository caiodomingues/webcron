export const queueConfig = {
  maxSize: parseInt(process.env.QUEUE_MAX_SIZE || "60", 10),
  retryInterval: parseInt(process.env.QUEUE_RETRY_INTERVAL || "1000", 10), // ms
  sleepMinutes: parseInt(process.env.QUEUE_SLEEP_MINUTES || "5", 10),
};
