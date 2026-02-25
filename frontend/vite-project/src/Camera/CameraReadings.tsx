import DataRow from "../Dashboard/Datarow";

interface LogEntry {
  timestamp: string;
  temperature: number | null;
  evaporator_temperature: number | null;
  humidity: number | null;
  supply_voltage: number | null;
}

interface Camera {
  target_temperature: number | null;
  defrost_threshold_temperature: number | null;
}

interface CameraReadingsProps {
  camera: Camera;
  latestLog: LogEntry | null;
}

export default function CameraReadings({ camera, latestLog }: CameraReadingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5">
        <div className="bg-[#ff7828] rounded-2xl p-4 text-center">
          <p className="text-[10px] text-white/70 tracking-wider mb-1">CURRENT TEMP</p>
          <p className="text-5xl font-bold text-white">
            {latestLog?.temperature != null ? `${latestLog.temperature.toFixed(1)}°` : "—"}
          </p>
          <p className="text-[10px] text-white/50 mt-1">Celsius</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5">
        <p className="text-[10px] text-black/30 tracking-wider mb-4">READINGS</p>
        <DataRow label="Target Temp" value={camera.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="Evaporator Temp" value={latestLog?.evaporator_temperature != null ? `${latestLog.evaporator_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="Defrost Threshold" value={camera.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="Humidity" value={latestLog?.humidity != null ? `${latestLog.humidity.toFixed(1)}%` : "—"} />
        <DataRow label="Voltage" value={latestLog?.supply_voltage != null ? `${latestLog.supply_voltage.toFixed(1)}V` : "—"} />
      </div>
    </div>
  );
}