import { useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.0.177:8080";

export function useApi(onLogout: () => void) {
  const fetchData = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await SecureStore.getItemAsync("access_token");
    try{
        const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        });

        if (res.status === 401) {
            await SecureStore.deleteItemAsync("access_token");
            onLogout();
            return null;
        }
        return res;
    } catch (e) {
        const error = e as Error
        console.log(error.message)
    }
  }, [onLogout]);

  return fetchData;
}