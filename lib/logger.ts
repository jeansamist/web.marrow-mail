type Level = "info" | "warn" | "error";

export type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: unknown) => void;
};

/**
 * Minimal console-backed logger for server actions and the API helpers.
 * Every line lands in the Next.js server log as `[scope] message`.
 *
 * Never put secrets in a message: passwords, auth/reset/challenge tokens,
 * OTP codes, share tokens, cookies, mail bodies or attachment contents.
 * Prefer ids, emails (as identifiers), names and counts.
 */
export function createLogger(scope: string): Logger {
  const write = (level: Level, message: string, error?: unknown) => {
    const line = `[${scope}] ${message}`;
    if (level === "error") {
      if (error === undefined) console.error(line);
      else console.error(line, error);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.info(line);
    }
  };

  return {
    info: (message) => write("info", message),
    warn: (message) => write("warn", message),
    error: (message, error) => write("error", message, error),
  };
}

/**
 * Makes a request URL safe to log: drops the query string and masks
 * token-bearing path segments (public voice-note share links).
 */
export function redactUrl(url: string): string {
  const [path] = url.split("?");
  return path.replace(/(\/voice-notes\/)[^/]+/, "$1***");
}
