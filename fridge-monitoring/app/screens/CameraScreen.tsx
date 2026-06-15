import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Camera, LogEntry } from "../../types";
import DataRow from "../../components/camera/DataRow";
import StatusBadge from "../../components/camera/StatusBadge";
import { Circle, useFont, Text as TextSkia } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";


const screenWidth = Dimensions.get("window").width;

interface CameraScreenProps {
  fetchData: (endpoint: string, options?: RequestInit) => Promise<Response | null | undefined>;
  navigation: any;
  route: any;
}

interface ChartProps {
  title: string;
  data: { x: number; y: number }[];
  color: string;
  unit: string;
}

function ToolTip({ x, y, value, color }: { x: SharedValue<number>; y: SharedValue<number>; value: SharedValue<number>; color: string }) {
  const font = useFont(
    require("../../assets/fonts/inter-bold.ttf"),
    12
  );

  const chartWidth = screenWidth - 82;

  const label = useDerivedValue(() => `${value.value.toFixed(1)}`);
  const labelX = useDerivedValue(() => {
      // If too close to the right edge, show label to the left of the circle
      return x.value > chartWidth - 40 ? x.value - 40 : x.value + 10;
  });
  const labelY = useDerivedValue(() => {
    // If too close to top (less than 20px), show below the circle instead
    return y.value < 20 ? y.value + 24 : y.value - 10;
  });

  return (
    <>
      <Circle cx={x} cy={y} r={8} color={color} />
      <TextSkia
        x={labelX}
        y={labelY}
        text={label}
        font={font}
        color="#000000"
      />
    </>
  );
}
function Chart({ title, data, color, unit }: ChartProps) {
  const validData = data.filter(d => d.y !== null);
  if (validData.length === 0) return null;

  const { state, isActive } = useChartPressState({ x: 0, y: {y: 0 }});
  const font = useFont(require('../../assets/fonts/inter-regular.ttf'))

  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-black/5" style={{height: 250}}>
      <Text className="text-xs text-black/30 tracking-wider mb-2">{title} · ПОСЛЕДНИ 30 ДНИ</Text>
      <CartesianChart
      data={validData}
      xKey="x"
      yKeys={["y"]}
      axisOptions={{
        font
      }}
      chartPressState={state}
      >
        {({ points }) => {
          return (
            <>
              <Line points={points.y} color={color} strokeWidth={2} />
              {isActive && (
              <ToolTip x={state.x.position} y={state.y.y.position} value={state.y.y.value} color={color} />
              )}
            </>

          )
        }}
      </CartesianChart>
    </View>
  );
}

export default function CameraScreen({ fetchData, navigation, route }: CameraScreenProps) {
  const { id } = route.params;
  const [camera, setCamera] = useState<Camera | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    const res = await fetchData(`/dashboard/camera/${id}`);
    if (!res) return;
    const data = await res.json();
    setCamera(data.camera);
    setLogs(data.timestamps.map((ts: string, i: number) => ({
      timestamp: new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperature: data.temperatures[i],
      evaporator_temperature: data.temperatures_evaporator[i],
      humidity: data.humidities?.[i] ?? null,
      supply_voltage: data.supply_voltages[i],
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const latestLog = logs[logs.length - 1] ?? null;
  const isOnline = latestLog !== null;

  const toChartData = (key: keyof LogEntry) =>
    logs.map((log, index) => ({ x: index, y: log[key] as number }));

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-black/30 text-sm">Зарежда обект...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white ">
      {/* Header */}
      <View className="px-4 pb-4 mb-4 border-b border-black/5 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-black/30 text-sm">← Назад</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xs text-black/30">Обект</Text>
            <Text className="text-xl font-bold text-black">
              Камера-{String(id).padStart(2, "0")}
            </Text>
          </View>
        </View>
        <StatusBadge online={isOnline} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {/* Current Temp */}
        <View className="bg-[#ff7828] rounded-3xl p-6 mb-4 items-center">
          <Text className="text-xs text-white/70 tracking-wider mb-1">СЕГАШНА ТЕМПЕРАТУРА</Text>
          <Text className="text-6xl font-bold text-white">
            {latestLog?.temperature != null ? `${latestLog.temperature.toFixed(1)}°` : "—"}
          </Text>
          <Text className="text-xs text-white/50 mt-1">Целзий</Text>
        </View>

        {/* Readings */}
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-black/5">
          <Text className="text-xs text-black/30 tracking-wider mb-3">ОТЧЕТИ</Text>
          <DataRow label="Целева Температура" value={camera?.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="Температура на Изпарителя" value={latestLog?.evaporator_temperature != null ? `${latestLog.evaporator_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="Темпратура за Размразяване" value={camera?.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="Влажност" value={latestLog?.humidity != null ? `${latestLog.humidity.toFixed(1)}%` : "—"} />
          <DataRow label="Напрежение" value={latestLog?.supply_voltage != null ? `${latestLog.supply_voltage.toFixed(1)}V` : "—"} />
        </View>

        {/* Charts */}
        <Chart title="ТЕМПЕРАТУРА" data={toChartData("temperature")} color="#ff7828" unit="°" />
        <Chart title="ТЕМПЕРАТУРА НА ИЗПАРИТЕЛЯ" data={toChartData("evaporator_temperature")} color="#ffb347" unit="°" />
        <Chart title="ВЛАЖНОСТ" data={toChartData("humidity")} color="#333333" unit="%" />
        <Chart title="НАПРЕЖЕНИЕ" data={toChartData("supply_voltage")} color="#ff4444" unit="V" />
      </ScrollView>
    </SafeAreaView>
  );
}