export function StatusBadge({ color, bg, label }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}