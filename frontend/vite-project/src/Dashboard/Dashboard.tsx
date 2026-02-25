import { useState, useEffect } from "react";
import CameraCard from "./Cameracard";

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

interface DashboardProps {
  fetchData: (endpoint: string, options?: RequestInit) => Promise<Response | null>;
}

export default function Dashboard({ fetchData }: DashboardProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCameras = async () => {
    const res = await fetchData("/dashboard");
    if (!res) return;
    const data = await res.json();
    setCameras(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCameras();
    const interval = setInterval(loadCameras, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020d14] font-mono relative">

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.01) 2px, rgba(0,212,255,0.01) 4px)",
        }}
      />

      <div className="relative z-20 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-[#1e3a4a] pb-4 md:pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-[6px] md:tracking-[8px]">FRIGIDWATCH</h1>
            <p className="text-[10px] text-[#4a7a8a] tracking-[3px] mt-1">MONITORING CONTROL SYSTEM v1.0</p>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse" />
              <span className="text-[#00ff88] text-xs tracking-[3px]">LIVE</span>
            </div>
            <span className="hidden md:block text-[10px] text-[#4a7a8a] tracking-[2px]">
              {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-[#00d4ff] text-xs tracking-[4px]">
            LOADING UNITS...
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-[#4a7a8a] text-xs tracking-[4px]">
            NO UNITS DETECTED
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {cameras.map((camera) => (
                <div key={camera.id} className="snap-center flex-shrink-0 w-[85vw]">
                  <CameraCard camera={camera} fetchData={fetchData} />
                </div>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-6">
              {cameras.map((camera) => (
                <CameraCard key={camera.id} camera={camera} fetchData={fetchData} />
              ))}
            </div>
          </>
        )}

        {/* Mobile scroll indicator */}
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {cameras.map((camera) => (
            <div key={camera.id} className="w-1.5 h-1.5 rounded-full bg-[#1e3a4a]" />
          ))}
        </div>
      </div>
    </div>
  );
}