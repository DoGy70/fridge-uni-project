interface ToggleSliderProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

export default function ToggleSlider({ value, onChange, disabled = false, label }: ToggleSliderProps) {
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