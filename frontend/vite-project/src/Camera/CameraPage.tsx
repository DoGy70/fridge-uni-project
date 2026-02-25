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
      timestamp: new Date(ts).toLocaleDateString(),
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
    <div className="min-h-screen bg-[#020d14] flex items-center justify-center font-mono text-[#00d4ff] text-xs tracking-[4px]">
      LOADING UNIT...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020d14] font-mono relative">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-10" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.01) 2px, rgba(0,212,255,0.01) 4px)",
      }} />

      <div className="relative z-20 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-[#1e3a4a] pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[#4a7a8a] hover:text-[#00d4ff] transition-colors text-xs tracking-[2px]"
            >
              ← BACK
            </button>
            <div>
              <p className="text-[10px] text-[#4a7a8a] tracking-[3px]">UNIT</p>
              <h1 className="text-2xl font-bold text-white tracking-[6px]">
                CAM-{String(id).padStart(2, "0")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {saving && <span className="text-[10px] text-[#00d4ff] tracking-[2px] animate-pulse">SAVING...</span>}
            <div className={`flex items-center gap-2 px-3 py-1 border ${
              latestLog ? "border-[#00ff88] text-[#00ff88]" : "border-[#ff4444] text-[#ff4444]"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${latestLog ? "bg-[#00ff88] animate-pulse" : "bg-[#ff4444]"}`} />
              <span className="text-[9px] tracking-[2px]">{latestLog ? "ONLINE" : "OFFLINE"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: readings + controls */}
          <div className="flex flex-col gap-6">
            <CameraReadings camera={camera!} latestLog={latestLog} />
            <CameraControls
              autoMode={autoMode}
              compressorOn={compressorOn}
              ventilationOn={ventilationOn}
              heaterOn={heaterOn}
              onAutoMode={async (v) => { setAutoMode(v); await updateCamera({ auto_mode: v }); }}
              onCompressor={async (v) => { setCompressorOn(v); await updateCamera({ compressor_on: v }); }}
              onVentilation={async (v) => { setVentilationOn(v); await updateCamera({ ventilation_on: v }); }}
              onHeater={async (v) => { setHeaterOn(v); await updateCamera({ heater_on: v }); }}
            />
          </div>

          {/* Right: charts */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <CameraChart
              title="TEMPERATURE"
              data={logs}
              unit="°"
              lines={[
                { dataKey: "temperature", stroke: "#00d4ff", name: "TEMP" },
                { dataKey: "evaporator_temperature", stroke: "#00ff88", name: "EVAPORATOR" },
              ]}
            />
            <CameraChart
              title="HUMIDITY"
              data={logs}
              unit="%"
              lines={[{ dataKey: "humidity", stroke: "#ff9500", name: "HUMIDITY" }]}
            />
            <CameraChart
              title="VOLTAGE"
              data={logs}
              unit="V"
              lines={[{ dataKey: "supply_voltage", stroke: "#ff4444", name: "VOLTAGE" }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}