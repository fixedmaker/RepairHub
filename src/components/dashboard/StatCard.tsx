import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "red" | "blue" | "green" | "amber";
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = "red" }: StatCardProps) {
  const colors = {
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  const iconColors = {
    red: "text-red-500",
    blue: "text-blue-500",
    green: "text-green-500",
    amber: "text-amber-500",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colors[color])}>
          <Icon className={cn("w-6 h-6", iconColors[color])} />
        </div>
        {trend && (
          <span className={cn("text-xs font-bold px-2 py-1 rounded-full", trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
