import { View, Text, TouchableOpacity } from "react-native";
import { Camera } from "../../types";
import DataRow from "./DataRow";
import StatusBadge from "./StatusBadge";

interface CameraCardProps {
  camera: Camera;
  onPress: () => void;
}

export default function CameraCard({ camera, onPress }: CameraCardProps) {
  const isOnline = camera.temperature !== null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-black/5"
      activeOpacity={0.8}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-xs text-black/30 mb-0.5">Unit</Text>
          <Text className="text-xl font-bold text-black">
            CAM-{String(camera.id).padStart(2, "0")}
          </Text>
        </View>
        <StatusBadge online={isOnline} />
      </View>

      {/* Temp Display */}
      <View className="bg-[#ff7828] rounded-2xl p-4 mb-4 items-center">
        <Text className="text-xs text-white/70 tracking-wider mb-1">CURRENT TEMP</Text>
        <Text className="text-4xl font-bold text-white">
          {camera.temperature != null ? `${camera.temperature.toFixed(1)}°` : "—"}
        </Text>
        <Text className="text-xs text-white/50 mt-1">Celsius</Text>
      </View>

      {/* Data Rows */}
      <DataRow label="Target Temp" value={camera.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
      <DataRow label="Evaporator Temp" value={camera.evaporator_temperature != null ? `${camera.evaporator_temperature.toFixed(1)}°C` : "—"} />
      <DataRow label="Defrost Threshold" value={camera.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
      <DataRow label="Humidity" value={camera.humidity != null ? `${camera.humidity.toFixed(1)}%` : "—"} />
      <DataRow label="Voltage" value={camera.supply_voltage != null ? `${camera.supply_voltage.toFixed(1)}V` : "—"} />
    </TouchableOpacity>
  );
}