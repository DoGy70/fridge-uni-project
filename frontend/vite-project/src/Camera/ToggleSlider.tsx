interface ToggleSliderProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

export default function ToggleSlider({ value, onChange, disabled = false, label }: ToggleSliderProps) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${disabled ? "opacity-30" : ""}`}>
      <span className="text-xs text-black/50">{label}</span>
      <button
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
          value ? "bg-[#ff7828]" : "bg-black/10"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-300 ${
          value ? "translate-x-6 bg-white" : "translate-x-1 bg-white"
        }`} />
      </button>
    </div>
  );
}