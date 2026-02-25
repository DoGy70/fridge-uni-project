interface DataRowProps {
  label: string;
  value: string;
}

export default function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-black/5">
      <span className="text-xs text-black/40">{label}</span>
      <span className="text-sm text-black font-medium">{value}</span>
    </div>
  );
}