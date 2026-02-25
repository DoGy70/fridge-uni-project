import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CameraReadings from "./CameraReadings";
import CameraControls from "./CameraControls";
import CameraChart from "./CameraChart";

interface Camera {
  id: number;
  compressor_on: boolean;
  ventilation_on: boolean;
  heater_on: boolean;
  auto_mode: boolean;
  target_temperature: number | null;
  defrost_threshold_temperature: number | null;
  status: string | null;
  problem: boolean;
}

interface LogEntry {
  timestamp: string;
  temperature: number | null;
  evaporator_temperature: number | null;
  humidity: number | null;
  supply_voltage: number | null;
}

interface CameraPageProps {
  fetchData: (endpoint: string, options?: RequestInit) => Promise<Response | null>;
}

export default function CameraPage({ fetchData }: CameraPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [compressorOn, setCompressorOn] = useState<boolean>(false);
  const [ventilationOn, setVentilationOn] = useState<boolean>(false);
  const [heaterOn, setHeaterOn] = useState<boolean>(false);

  const loadData = async () => {
    const res = await fetchData(`/dashboard/camera/${id}`);
    if (!res) return;
    const data = await res.json();
    setCamera(data.camera);
    setLogs(data.timestamps.map((ts: string, i: number) => ({
      timestamp: new Date(ts).toLocaleTimeString(),
      temperature: data.temperatures[i],
      evaporator_temperature: data.temperatures_evaporator[i],
      humidity: data.humidities?.[i] ?? null,
      supply_voltage: data.supply_voltages[i],
    })));
    setAutoMode(data.camera.auto_mode);
    setCompressorOn(data.camera.compressor_on);
    setVentilationOn(data.camera.ventilation_on);
    setHeaterOn(data.camera.heater_on);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const updateCamera = async (updates: object) => {
    setSaving(true);
    await fetchData(`/camera/${id}/instructions`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setSaving(false);
  };

  const latestLog = logs[logs.length - 1] ?? null;

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-black/30 text-sm">
      Loading unit...
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <div className="fixed top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#ff7828] opacity-5 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-black/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-black/30 hover:text-[#ff7828] transition-colors text-sm"
            >
              ← Back
            </button>
            <div>
              <p className="text-xs text-black/30">Unit</p>
              <h1 className="text-2xl font-bold text-black">CAM-{String(id).padStart(2, "0")}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-[#ff7828] animate-pulse">Saving...</span>}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${
              latestLog ? "bg-[#ff7828]/10 text-[#ff7828]" : "bg-black/5 text-black/30"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${latestLog ? "bg-[#ff7828] animate-pulse" : "bg-black/20"}`} />
              {latestLog ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <CameraReadings camera={camera!} latestLog={latestLog} />
            <CameraControls
              autoMode={autoMode}
              compressorOn={compressorOn}
              ventilationOn={ventilationOn}
              heaterOn={heaterOn}
              targetTemperature={camera?.target_temperature ?? null}
              defrostThreshold={camera?.defrost_threshold_temperature ?? null}
              onAutoMode={async (v) => { setAutoMode(v); await updateCamera({ auto_mode: v }); }}
              onCompressor={async (v) => { setCompressorOn(v); await updateCamera({ compressor_on: v }); }}
              onVentilation={async (v) => { setVentilationOn(v); await updateCamera({ ventilation_on: v }); }}
              onHeater={async (v) => { setHeaterOn(v); await updateCamera({ heater_on: v }); }}
              onSave={async (updates: any) => {
                await updateCamera(updates);
                setCamera((prev) => prev ? { ...prev, ...updates } : prev);
              }}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <CameraChart
              title="TEMPERATURE"
              data={logs}
              unit="°"
              lines={[
                { dataKey: "temperature", stroke: "#ff7828", name: "Temp" },
                { dataKey: "evaporator_temperature", stroke: "#ffb347", name: "Evaporator" },
              ]}
            />
            <CameraChart
              title="HUMIDITY"
              data={logs}
              unit="%"
              lines={[{ dataKey: "humidity", stroke: "#333333", name: "Humidity" }]}
            />
            <CameraChart
              title="VOLTAGE"
              data={logs}
              unit="V"
              lines={[{ dataKey: "supply_voltage", stroke: "#ff4444", name: "Voltage" }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}