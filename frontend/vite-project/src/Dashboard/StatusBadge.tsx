interface StatusBadgeProps {
  on: boolean;
  label: string;
}

export default function StatusBadge({ on, label }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${on ? "bg-[#ff7828] shadow-[0_0_6px_#ff7828]" : "bg-black/10"}`} />
      <span className={`text-xs ${on ? "text-black/80" : "text-black/25"}`}>{label}</span>
    </div>
  );
}