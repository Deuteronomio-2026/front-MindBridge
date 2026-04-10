const toBooleanFlag = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

export const featureFlags = {
  groupEvents: toBooleanFlag(import.meta.env.VITE_FEATURE_GROUP_EVENTS, false),
  eventNotifications: toBooleanFlag(import.meta.env.VITE_FEATURE_EVENT_NOTIFICATIONS, false),
};

export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature];
};
