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
    <div className="border border-[#1e3a4a] bg-[#020d14] p-6">
      <p className="text-[9px] text-[#4a7a8a] tracking-[3px] mb-6">{title} · LAST 30 DAYS</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0d2030" />
          <XAxis dataKey="timestamp" tick={{ fill: "#4a7a8a", fontSize: 10 }} />
          <YAxis tick={{ fill: "#4a7a8a", fontSize: 10 }} unit={unit} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: "10px", color: "#4a7a8a" }} />
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