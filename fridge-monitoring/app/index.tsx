import "../global.css";
import { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { View, Text, TouchableOpacity } from "react-native";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import CameraScreen from "./screens/CameraScreen";
import { useApi } from "../hooks/useApi";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {StatusBar} from "expo-status-bar"

const Stack = createNativeStackNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useApi(() => setLoggedIn(false));

  useEffect(() => {
      const checkToken = async () => {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
            const res = await fetchData("/me");
            setLoggedIn(res?.ok ?? false);
        }
        setLoading(false)
      };
      checkToken();
    }, []);

    const onLogout = () => setLoggedIn(false)

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync("access_token");
        onLogout();
    };

   if (loading) return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-black/30 text-sm">Зарежда се...</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!loggedIn ? (
            <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => setLoggedIn(true)} />}
            </Stack.Screen>
        ) : (
            <>
            <Stack.Screen name="Dashboard"
                options={{
                    headerShown: true,
                    header: () => (
                        <View className="px-4 pb-4 border-b border-black/5 flex-row justify-between items-center bg-white">
                            <View>
                                <Text className="text-2xl font-bold text-black tracking-tight">ХладоСтраж</Text>
                                <Text className="text-xs text-black/30 mt-0.5">Система за Мониторинг</Text>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row items-center gap-2 bg-black/5 rounded-full px-3 py-1.5">
                                    <View className="w-2 h-2 rounded-full bg-[#ff7828]" />
                                    <Text className="text-xs text-black/50">Включен</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleLogout}
                                    className="bg-black/5 rounded-full px-3 py-1.5"
                                  >
                                    <Text className="text-xs text-black/50">Изход</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                    
                }}
            >
                {(props) => {
                return (<DashboardScreen
                    {...props}
                    fetchData={fetchData} 
                    />)
                }}
            </Stack.Screen>
            <Stack.Screen name="Camera" options={{headerShown: false}}>
                {(props) => <CameraScreen {...props} fetchData={fetchData} />}
            </Stack.Screen>
            </>
        )}
        </Stack.Navigator>
    </SafeAreaProvider>
  );
}