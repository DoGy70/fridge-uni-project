import { useState } from "react";
import ToggleSlider from "./ToggleSlider";

interface CameraControlsProps {
  autoMode: boolean;
  compressorOn: boolean;
  ventilationOn: boolean;
  heaterOn: boolean;
  targetTemperature: number | null;
  defrostThreshold: number | null;
  onAutoMode: (value: boolean) => void;
  onCompressor: (value: boolean) => void;
  onVentilation: (value: boolean) => void;
  onHeater: (value: boolean) => void;
  onSave: (updates: object) => void;
}

export default function CameraControls({
  autoMode, compressorOn, ventilationOn, heaterOn,
  targetTemperature, defrostThreshold,
  onAutoMode, onCompressor, onVentilation, onHeater, onSave,
}: CameraControlsProps) {
  const [targetTemp, setTargetTemp] = useState<string>(targetTemperature?.toString() ?? "");
  const [defrostTemp, setDefrostTemp] = useState<string>(defrostThreshold?.toString() ?? "");

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5">
      <p className="text-[10px] text-black/30 tracking-wider mb-4">CONTROLS</p>

      <ToggleSlider label="Auto Mode" value={autoMode} onChange={onAutoMode} />
      <div className="border-t border-black/5 my-1" />
      <ToggleSlider label="Compressor" value={compressorOn} onChange={onCompressor} disabled={autoMode} />
      <ToggleSlider label="Ventilation" value={ventilationOn} onChange={onVentilation} disabled={autoMode} />
      <ToggleSlider label="Heater" value={heaterOn} onChange={onHeater} disabled={autoMode} />

      <div className="border-t border-black/5 mt-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-black/40">Target Temp</span>
          <input
            type="number"
            value={targetTemp}
            onChange={(e) => setTargetTemp(e.target.value)}
            className="bg-black/5 rounded-xl px-3 py-1.5 text-sm text-black outline-none border border-transparent focus:border-[#ff7828] w-24 text-right transition-colors"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-black/40">Defrost Threshold</span>
          <input
            type="number"
            value={defrostTemp}
            onChange={(e) => setDefrostTemp(e.target.value)}
            className="bg-black/5 rounded-xl px-3 py-1.5 text-sm text-black outline-none border border-transparent focus:border-[#ff7828] w-24 text-right transition-colors"
          />
        </div>
        <button
          onClick={() => onSave({ target_temperature: parseFloat(targetTemp), defrost_threshold_temperature: parseFloat(defrostTemp) })}
          className="mt-1 bg-[#ff7828] hover:bg-[#e86a1a] text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(255,120,40,0.2)]"
        >
          Save
        </button>
      </div>
    </div>
  );
}