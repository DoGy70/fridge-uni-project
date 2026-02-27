// hooks/useFetch.ts
import { useCallback } from "react";

const BASE_URL = "http://localhost:8080";

export function useFetch(onLogout: () => void) {
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    let res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (res.status === 401) {
      res = await fetch(`${BASE_URL}/refresh_token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!res.ok) {
        onLogout();
        return null;
      }

      res = await fetch(`${BASE_URL}${endpoint}`,{
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }

    return res;
  }, [onLogout]);

  return authFetch;
}