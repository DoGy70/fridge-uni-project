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
    <div className="flex flex-col gap-6">
      {/* Current Temp */}
      <div className="border border-[#1e3a4a] bg-[#020d14] p-6">
        <div className="bg-[#030f1a] border border-[#0d2030] p-4 text-center">
          <p className="text-[9px] text-[#4a7a8a] tracking-[3px] mb-1">CURRENT TEMP</p>
          <p className="text-5xl font-bold text-[#00d4ff] drop-shadow-[0_0_12px_rgba(0,212,255,0.4)]">
            {latestLog?.temperature != null ? `${latestLog.temperature.toFixed(1)}°` : "—"}
          </p>
          <p className="text-[9px] text-[#4a7a8a] tracking-[2px] mt-1">CELSIUS</p>
        </div>
      </div>

      {/* Data Rows */}
      <div className="border border-[#1e3a4a] bg-[#020d14] p-6">
        <p className="text-[9px] text-[#4a7a8a] tracking-[3px] mb-4">READINGS</p>
        <DataRow label="TARGET TEMP" value={camera.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="EVAPORATOR TEMP" value={latestLog?.evaporator_temperature != null ? `${latestLog.evaporator_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="DEFROST THRESHOLD" value={camera.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="HUMIDITY" value={latestLog?.humidity != null ? `${latestLog.humidity.toFixed(1)}%` : "—"} />
        <DataRow label="VOLTAGE" value={latestLog?.supply_voltage != null ? `${latestLog.supply_voltage.toFixed(1)}V` : "—"} />
      </div>
    </div>
  );
}