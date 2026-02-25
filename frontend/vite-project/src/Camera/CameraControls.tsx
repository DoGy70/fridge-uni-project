import ToggleSlider from "./ToggleSlider";

interface CameraControlsProps {
  autoMode: boolean;
  compressorOn: boolean;
  ventilationOn: boolean;
  heaterOn: boolean;
  onAutoMode: (value: boolean) => void;
  onCompressor: (value: boolean) => void;
  onVentilation: (value: boolean) => void;
  onHeater: (value: boolean) => void;
}

export default function CameraControls({
  autoMode,
  compressorOn,
  ventilationOn,
  heaterOn,
  onAutoMode,
  onCompressor,
  onVentilation,
  onHeater,
}: CameraControlsProps) {
  return (
    <div className="border border-[#1e3a4a] bg-[#020d14] p-6">
      <p className="text-[9px] text-[#4a7a8a] tracking-[3px] mb-4">CONTROLS</p>
      <ToggleSlider label="AUTO MODE" value={autoMode} onChange={onAutoMode} />
      <div className="border-t border-[#0d2030] my-2" />
      <ToggleSlider label="COMPRESSOR" value={compressorOn} onChange={onCompressor} disabled={autoMode} />
      <ToggleSlider label="VENTILATION" value={ventilationOn} onChange={onVentilation} disabled={autoMode} />
      <ToggleSlider label="HEATER" value={heaterOn} onChange={onHeater} disabled={autoMode} />
    </div>
  );
}