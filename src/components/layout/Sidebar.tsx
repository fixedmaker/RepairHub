import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  UserCircle, 
  Laptop, 
  History, 
  FileText, 
  Settings,
  Wrench,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { role, logout } = useAuth();
  const location = useLocation();

  const adminMenu = [
    { name: 'Dashboard', icon: BarChart3, path: '/app' },
    { name: 'Data Teknisi', icon: Wrench, path: '/app/technicians' },
    { name: 'Data Pelanggan', icon: UserCircle, path: '/app/customers' },
    { name: 'Data Barang', icon: Laptop, path: '/app/devices' },
    { name: 'Laporan', icon: FileText, path: '/app/reports' },
    { name: 'User Management', icon: Users, path: '/app/users' },
  ];

  const techMenu = [
    { name: 'Dashboard', icon: BarChart3, path: '/app' },
    { name: 'Data Barang', icon: Laptop, path: '/app/devices' },
    { name: 'Riwayat Perbaikan', icon: History, path: '/app/history' },
    { name: 'Laporan Perbaikan', icon: FileText, path: '/app/reports' },
  ];

  const menu = role === 'admin' ? adminMenu : techMenu;

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-repair-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-200">
          R
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight">RepairHub</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{role}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-red-50 text-red-600 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-red-500" : "text-slate-400 group-hover:text-slate-600"
              )} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
