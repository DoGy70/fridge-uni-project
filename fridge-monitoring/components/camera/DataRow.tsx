import { View, Text } from "react-native";

interface DataRowProps {
  label: string;
  value: string;
}

export default function DataRow({ label, value }: DataRowProps) {
  return (
    <View className="flex-row justify-between items-center py-2.5 border-b border-black/5">
      <Text className="text-xs text-black/40">{label}</Text>
      <Text className="text-sm text-black font-medium">{value}</Text>
    </View>
  );
}