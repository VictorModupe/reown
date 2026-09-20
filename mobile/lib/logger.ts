type LogLevel = "log" | "warn" | "error";

type LogPayload = Record<string, unknown>;

const formatLog = (level: LogLevel, event: string, payload: LogPayload = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...payload,
  };

  if (level === "warn") {
    console.warn("[user-event]", entry);
    return;
  }

  if (level === "error") {
    console.error("[user-event]", entry);
    return;
  }

  console.log("[user-event]", entry);
};

export const logUserAction = (action: string, payload: LogPayload = {}) => {
  formatLog("log", action, payload);
};

export const logUserWarning = (action: string, payload: LogPayload = {}) => {
  formatLog("warn", action, payload);
};

export const logUserError = (action: string, payload: LogPayload = {}) => {
  formatLog("error", action, payload);
};
