import pino from "pino";
import { logConfig } from "../config/log";

const logger = pino({
  level: logConfig.level,
  transport: logConfig.pretty
    ? {
        target: "pino-pretty",
        options: logConfig.prettyOptions,
      }
    : undefined,
});

export default logger;
