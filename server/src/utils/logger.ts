import pino from "pino";
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const infoStream = pino.destination(path.join(logDir, "info.log"));
const errorStream = pino.destination(path.join(logDir, "error.log"));

const logger = pino(
  {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    formatters: {
      level: (label) => ({ level: label }), // cleaner level
    },
    timestamp: pino.stdTimeFunctions.isoTime, // readable time
  },
  pino.multistream([
    { stream: infoStream, level: "info" },
    { stream: errorStream, level: "error" },
    { stream: process.stdout, level: "debug" }, // keep console logs
  ])
);

export default logger;
