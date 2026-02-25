interface DataRowProps {
  label: string;
  value: string;
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#0d2030]">
      <span className="text-[10px] text-[#4a7a8a] tracking-[2px]">{label}</span>
      <span className="text-sm text-[#00d4ff] font-mono">{value}</span>
    </div>
  );
}

export default DataRow