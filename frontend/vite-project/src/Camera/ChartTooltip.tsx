interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/10 rounded-2xl p-3 shadow-lg">
        <p className="text-xs text-black/40 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs font-medium text-black">
            {entry.name}: <span style={{ color: entry.color }}>{entry.value?.toFixed(2)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}