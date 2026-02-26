import { View, Text } from "react-native";

interface StatusBadgeProps {
  online: boolean;
}

export default function StatusBadge({ online }: StatusBadgeProps) {
  return (
    <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${online ? "bg-[#ff7828]/10" : "bg-black/5"}`}>
      <View className={`w-1.5 h-1.5 rounded-full ${online ? "bg-[#ff7828]" : "bg-black/20"}`} />
      <Text className={`text-xs ${online ? "text-[#ff7828]" : "text-black/30"}`}>
        {online ? "Online" : "Offline"}
      </Text>
    </View>
  );
}