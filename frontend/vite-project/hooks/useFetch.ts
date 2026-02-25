// hooks/useFetch.ts
import { useCallback } from "react";

const BASE_URL = "http://localhost:8080";

export function useFetch(onLogout: () => void) {
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
});

    if (res.status === 401) {
      onLogout();
      return null;
    }

    return res;
  }, [onLogout]);

  return authFetch;
}