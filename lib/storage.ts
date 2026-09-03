export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore storage errors
      }
    }
  },
  remove(key: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore storage errors
      }
    }
  },
};
