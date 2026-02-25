interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#030f1a] border border-[#1e3a4a] p-3 font-mono">
        <p className="text-[10px] text-[#4a7a8a] tracking-[2px] mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-[11px]" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}