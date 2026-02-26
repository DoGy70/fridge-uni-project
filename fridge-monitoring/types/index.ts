export interface Camera {
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
  humidity: number | null;
  status: string | null;
  problem: boolean;
}

export interface LogEntry {
  timestamp: string;
  temperature: number | null;
  evaporator_temperature: number | null;
  humidity: number | null;
  supply_voltage: number | null;
}

export interface CameraDetail {
  camera: Camera;
  timestamps: string[];
  temperatures: number[];
  temperatures_evaporator: number[];
  humidities: number[];
  voltages: number[];
}