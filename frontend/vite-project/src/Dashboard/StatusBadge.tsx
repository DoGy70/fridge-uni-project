interface StatusBadgeProps {
  on: boolean;
  label: string;
}

export default function StatusBadge({ on, label }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          on ? "bg-[#00ff88] shadow-[0_0_6px_#00ff88]" : "bg-[#1e3a4a]"
        }`}
      />
      <span className={`text-[10px] tracking-[2px] ${on ? "text-[#00ff88]" : "text-[#2a4a5a]"}`}>
        {label}
      </span>
    </div>
  );
}