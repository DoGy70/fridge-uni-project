import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import ChartTooltip from "./ChartTooltip";

interface ChartLine {
  dataKey: string;
  stroke: string;
  name: string;
}

interface CameraChartProps {
  title: string;
  data: any[];
  lines: ChartLine[];
  unit: string;
}

export default function CameraChart({ title, data, lines, unit }: CameraChartProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/5">
      <p className="text-xs text-black/30 tracking-wider mb-6">{title} · LAST 30 DAYS</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="timestamp" tick={{ fill: "rgba(0,0,0,0.3)", fontSize: 10 }} />
          <YAxis tick={{ fill: "rgba(0,0,0,0.3)", fontSize: 10 }} unit={unit} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "rgba(0,0,0,0.4)" }} />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              dot={false}
              strokeWidth={2}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}