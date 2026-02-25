import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataRow from "./Datarow";

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

interface ToggleSliderProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

function ToggleSlider({ value, onChange, disabled = false, label }: ToggleSliderProps) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? "opacity-40" : ""}`}>
      <span className="text-[10px] text-[#4a7a8a] tracking-[2px]">{label}</span>
      <button
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
          value ? "bg-[#00d4ff]" : "bg-[#1e3a4a]"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-300 ${
            value ? "translate-x-5 bg-[#020d14]" : "translate-x-0.5 bg-[#4a7a8a]"
          }`}
        />
      </button>
    </div>
  );
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

  const handleAutoMode = async (value: boolean) => {
    setAutoMode(value);
    await updateCamera({ auto_mode: value });
  };

  const handleCompressor = async (value: boolean) => {
    setCompressorOn(value);
    await updateCamera({ compressor_on: value });
  };

  const handleVentilation = async (value: boolean) => {
    setVentilationOn(value);
    await updateCamera({ ventilation_on: value });
  };

  const handleHeater = async (value: boolean) => {
    setHeaterOn(value);
    await updateCamera({ heater_on: value });
  };

  return (
    <div className="border border-[#1e3a4a] bg-[#020d14] p-6 hover:border-[#00d4ff] transition-colors duration-300 shadow-[0_0_30px_rgba(0,212,255,0.03)] cursor-pointer">
      {/* Card Header - clickable */}
      <div onClick={() => {navigate(`/camera/${camera.id}`)}}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-[#4a7a8a] tracking-[3px] mb-1">UNIT</p>
            <h2 className="text-2xl font-bold text-white tracking-[4px]">
              CAM-{String(camera.id).padStart(2, "0")}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-2 px-3 py-1 border ${
              isOnline ? "border-[#00ff88] text-[#00ff88]" : "border-[#ff4444] text-[#ff4444]"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#00ff88] animate-pulse" : "bg-[#ff4444]"}`} />
              <span className="text-[9px] tracking-[2px]">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
            {saving && <span className="text-[9px] text-[#00d4ff] tracking-wider animate-pulse">SAVING...</span>}
          </div>
        </div>

        {/* Temperature Display */}
        <div className="bg-[#030f1a] border border-[#0d2030] p-4 mb-6 text-center">
          <p className="text-[9px] text-[#4a7a8a] tracking-[3px] mb-1">CURRENT TEMP</p>
          <p className="text-4xl font-bold text-[#00d4ff] drop-shadow-[0_0_12px_rgba(0,212,255,0.4)]">
            {camera.temperature != null ? `${camera.temperature.toFixed(1)}°` : "—"}
          </p>
          <p className="text-[9px] text-[#4a7a8a] tracking-[2px] mt-1">CELSIUS</p>
        </div>

        {/* Data Rows */}
        <div className="mb-6">
          <DataRow label="TARGET TEMP" value={camera.target_temperature != null ? `${camera.target_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="EVAPORATOR TEMP" value={camera.evaporator_temperature != null ? `${camera.evaporator_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="DEFROST THRESHOLD" value={camera.defrost_threshold_temperature != null ? `${camera.defrost_threshold_temperature.toFixed(1)}°C` : "—"} />
          <DataRow label="VOLTAGE" value={camera.supply_voltage != null ? `${camera.supply_voltage.toFixed(1)}V` : "—"} />
        </div>
      </div>
      {/* Controls */}
      <div className="border-t border-[#0d2030] pt-4">
        <p className="text-[9px] text-[#4a7a8a] tracking-[3px] mb-3">CONTROLS</p>

        {/* Auto Mode Toggle */}
        <ToggleSlider
          label="AUTO MODE"
          value={autoMode}
          onChange={handleAutoMode}
        />

        {/* Divider */}
        <div className="border-t border-[#0d2030] my-2" />

        {/* Manual Controls - only active when auto mode is off */}
        <ToggleSlider
          label="COMPRESSOR"
          value={compressorOn}
          onChange={handleCompressor}
          disabled={autoMode}
        />
        <ToggleSlider
          label="VENTILATION"
          value={ventilationOn}
          onChange={handleVentilation}
          disabled={autoMode}
        />
        <ToggleSlider
          label="HEATER"
          value={heaterOn}
          onChange={handleHeater}
          disabled={autoMode}
        />
      </div>
    </div>
  );
}