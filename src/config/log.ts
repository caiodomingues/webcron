export const logConfig = {
  level: process.env.LOG_LEVEL || "info",
  pretty: process.env.NODE_ENV !== "production",
  prettyOptions: {
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  },
};
