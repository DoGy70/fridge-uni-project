import { useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.0.177:8080";

export function useApi(onLogout: () => void) {
  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/refresh_token`, {
      method: "POST",
      headers: {
        'ContentType': 'application/json',
        Authorization: `Bearer ${refreshToken}`
      }
    });

    if (!res.ok) return null

    const data = await res.json()
    await SecureStore.setItemAsync("access_token", data.access_token);
    return data.access_token
  }

    const fetchData = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      let token = await SecureStore.getItemAsync("access_token");

      let res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (res.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
          onLogout();
          return null;
        }

        // Retry само при 401
        res = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
        });
      }

      return res;
    } catch (e) {
      const error = e as Error;
      console.log(error.message);
      return null;
    }
  }, [onLogout]);
  return fetchData;
}