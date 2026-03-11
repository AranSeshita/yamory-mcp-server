type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

function log(entry: LogEntry): void {
  process.stderr.write(JSON.stringify(entry) + "\n");
}

export function logInfo(message: string, data?: Record<string, unknown>): void {
  log({ level: "info", message, ...data });
}

export function logWarn(message: string, data?: Record<string, unknown>): void {
  log({ level: "warn", message, ...data });
}

export function logError(
  message: string,
  data?: Record<string, unknown>
): void {
  log({ level: "error", message, ...data });
}
