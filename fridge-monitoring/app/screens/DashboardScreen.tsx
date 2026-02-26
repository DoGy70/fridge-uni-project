import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { Camera } from "../../types";
import CameraCard from "../../components/camera/CameraCard";

interface DashboardScreenProps {
  fetchData: (endpoint: string, options?: RequestInit) => Promise<Response | null | undefined>;
  navigation: any;
}

export default function DashboardScreen({ fetchData, navigation }: DashboardScreenProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadCameras = async () => {
    const res = await fetchData("/dashboard");
    if (!res) return;
    const data = await res.json();
    setCameras(data);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCameras();
    setRefreshing(false);
  }, []);

  

  useEffect(() => {
    loadCameras();
    const interval = setInterval(loadCameras, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-black/30 text-sm">Loading units...</Text>
        </View>
      ) : (
        <FlatList
          data={cameras}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff7828" />
          }
          renderItem={({ item }) => (
            <CameraCard
              camera={item}
              onPress={() => navigation.navigate("Camera", { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-black/30 text-sm">No units detected</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}