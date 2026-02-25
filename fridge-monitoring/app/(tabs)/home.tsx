import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-slate-900">Home</Text>
      <Pressable
        className="mt-6 rounded-xl bg-slate-900 px-5 py-3"
        onPress={() => router.replace("/login")}
      >
        <Text className="font-semibold text-white">Log out</Text>
      </Pressable>
    </View>
  );
}