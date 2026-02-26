import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from "victory-native";
import { Camera, LogEntry } from "../../types";
import DataRow from "../../components/camera/DataRow";
import StatusBadge from "../../components/camera/StatusBadge";

const screenWidth = Dimensions.get("window").width;

interface CameraScreenProps {
  fetchData: (endpoint: string, options?: RequestInit) => Promise<Response | null | undefined>;
  navigation: any;
  route: any;
}

interface ChartProps {
  title: string;
  data: { x: string; y: number }[];
  color: string;
  unit: string;
}

function Chart({ title, data, color, unit }: ChartProps) {
  const validData = data.filter(d => d.y !== null);
  if (validData.length === 0) return null;

  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-black/5">
      <Text className="text-xs text-black/30 tracking-wider mb-2">{title} · LAST 30 DAYS</Text>
      <VictoryChart
        width={screenWidth - 64}
        height={180}
        theme={VictoryTheme.material}
        containerComponent={<VictoryVoronoiContainer />}
        padding={{ top: 10, bottom: 40, left: 50, right: 20 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: "rgba(0,0,0,0.1)" },
            tickLabels: { fontSize: 8, fill: "rgba(0,0,0,0.3)", angle: -30 },
            grid: { stroke: "transparent" },
          }}
          tickCount={4}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "rgba(0,0,0,0.1)" },
            tickLabels: { fontSize: 8, fill: "rgba(0,0,0,0.3)" },
            grid: { stroke: "rgba(0,0,0,0.05)", strokeDasharray: "3,3" },
          }}
          tickFormat={(t) => `${t}${unit}`}
        />
        <VictoryLine
          data={validData}
          style={{ data: { stroke: color, strokeWidth: 2 } }}
          interpolation="monotoneX"
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </View>
  );
}

export default function CameraScreen({ fetchData, navigation, route }: CameraScreenProps) {
  const { id } = route.params;
  const [camera, setCamera] = useState<Camera | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const insets = useSafeAreaInsets()

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
    logs.map((log) => ({ x: log.timestamp, y: log[key] as number }));

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-black/30 text-sm">Loading unit...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-black/5 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-black/30 text-sm">← Back</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xs text-black/30">Unit</Text>
            <Text className="text-xl font-bold text-black">
              CAM-{String(id).padStart(2, "0")}
            </Text>
          </View>
        </View>
        <StatusBadge online={isOnline} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {/* Current Temp */}
        <View className="bg-[#ff7828] rounded-3xl p-6 mb-4 items-center">
          <Text className="text-xs text-white/70 tracking-wider mb-1">CURRENT TEMP</Text>
          <Text className="text-6xl font-bold text-white">
            {latestLog?.temperature != null ? `${latestLog.temperature.toFixed(1)}°` : "—"}
          </Text>
          <Text className="text-xs text-white/50 mt-1">Celsius</Text>
        </View>

        {/* Readings */}
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-black/5">
          <Text className="text-xs text-black/30 tracking-wider mb-3">READINGS</Text>
          <DataRow label="Target Temp" value={camera?.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="Evaporator Temp" value={latestLog?.evaporator_temperature != null ? `${latestLog.evaporator_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="Defrost Threshold" value={camera?.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="Humidity" value={latestLog?.humidity != null ? `${latestLog.humidity.toFixed(1)}%` : "—"} />
          <DataRow label="Voltage" value={latestLog?.supply_voltage != null ? `${latestLog.supply_voltage.toFixed(1)}V` : "—"} />
        </View>

        {/* Charts */}
        <Chart title="TEMPERATURE" data={toChartData("temperature")} color="#ff7828" unit="°" />
        <Chart title="EVAPORATOR TEMP" data={toChartData("evaporator_temperature")} color="#ffb347" unit="°" />
        <Chart title="HUMIDITY" data={toChartData("humidity")} color="#333333" unit="%" />
        <Chart title="VOLTAGE" data={toChartData("supply_voltage")} color="#ff4444" unit="V" />
      </ScrollView>
    </SafeAreaView>
  );
}