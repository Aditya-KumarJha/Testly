function StatusCard({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="glass-panel hero-ring hover-lift flex items-center justify-between rounded-2xl border border-white/80 p-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-1 text-2xl font-semibold text-slate-900">{value}</h3>
      </div>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/80 ${bgColor}`}
      >
        {icon}
      </div>
    </div>
  );
}

export default StatusCard;
