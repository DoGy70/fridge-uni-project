import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataRow from "./Datarow";
import ToggleSlider from "../Camera/ToggleSlider";

interface Camera {
  id: number;
  compressor_on: boolean;
  ventilation_on: boolean;
  heater_on: boolean;
  auto_mode: boolean;
  target_temperature: number | null;
  defrost_threshold_temperature: number | null;
  temperature: number | null;
  evaporator_temperature: number | null;
  supply_voltage: number | null;
  status: string | null;
  problem: boolean;
}

interface CameraCardProps {
  camera: Camera;
  fetchData: (endpoint: string, options?: RequestInit) => Promise<Response | null>;
}

export default function CameraCard({ camera, fetchData }: CameraCardProps) {
  const navigate = useNavigate();
  const isOnline = camera.temperature !== null;

  const [autoMode, setAutoMode] = useState<boolean>(camera.auto_mode);
  const [compressorOn, setCompressorOn] = useState<boolean>(camera.compressor_on);
  const [ventilationOn, setVentilationOn] = useState<boolean>(camera.ventilation_on);
  const [heaterOn, setHeaterOn] = useState<boolean>(camera.heater_on);
  const [saving, setSaving] = useState<boolean>(false);

  const updateCamera = async (updates: object) => {
    setSaving(true);
    await fetchData(`/camera/${camera.id}/instructions`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setSaving(false);
  };

  return (
    <div
      className="bg-white rounded-3xl p-6 cursor-pointer hover:shadow-[0_8px_40px_rgba(255,120,40,0.12)] transition-shadow duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5"
      onClick={() => navigate(`/camera/${camera.id}`)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-black/30 mb-0.5">Unit</p>
          <h2 className="text-xl font-bold text-black">CAM-{String(camera.id).padStart(2, "0")}</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
            isOnline ? "bg-[#ff7828]/10 text-[#ff7828]" : "bg-black/5 text-black/30"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#ff7828] animate-pulse" : "bg-black/20"}`} />
            {isOnline ? "Online" : "Offline"}
          </div>
          {saving && <span className="text-[10px] text-[#ff7828] animate-pulse">Saving...</span>}
        </div>
      </div>

      {/* Temp Display */}
      <div className="bg-[#ff7828] rounded-2xl p-4 mb-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <p className="text-[10px] text-white/70 mb-1 tracking-wider">CURRENT TEMP</p>
        <p className="text-4xl font-bold text-white">
          {camera.temperature != null ? `${camera.temperature.toFixed(1)}°` : "—"}
        </p>
        <p className="text-[10px] text-white/50 mt-1">Celsius</p>
      </div>

      {/* Data Rows */}
      <div className="mb-5">
        <DataRow label="Target Temp" value={camera.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="Evaporator Temp" value={camera.evaporator_temperature != null ? `${camera.evaporator_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="Defrost Threshold" value={camera.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
        <DataRow label="Voltage" value={camera.supply_voltage != null ? `${camera.supply_voltage.toFixed(1)}V` : "—"} />
      </div>

      {/* Controls */}
      <div className="border-t border-black/5 pt-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-[10px] text-black/30 tracking-wider mb-3">CONTROLS</p>
        <ToggleSlider label="Auto Mode" value={autoMode} onChange={async (v) => { setAutoMode(v); await updateCamera({ auto_mode: v }); }} />
        <div className="border-t border-black/5 my-1" />
        <ToggleSlider label="Compressor" value={compressorOn} onChange={async (v) => { setCompressorOn(v); await updateCamera({ compressor_on: v }); }} disabled={autoMode} />
        <ToggleSlider label="Ventilation" value={ventilationOn} onChange={async (v) => { setVentilationOn(v); await updateCamera({ ventilation_on: v }); }} disabled={autoMode} />
        <ToggleSlider label="Heater" value={heaterOn} onChange={async (v) => { setHeaterOn(v); await updateCamera({ heater_on: v }); }} disabled={autoMode} />
      </div>
    </div>
  );
}