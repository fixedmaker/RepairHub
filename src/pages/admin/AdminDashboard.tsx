import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Laptop, 
  Users, 
  Wrench, 
  AlertCircle, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Search
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import DeviceTable from '../../components/dashboard/DeviceTable';
import { api } from '../../services/api';
import { Device, User } from '../../types';
import { pdfExport } from '../../utils/pdfExport';

export default function AdminDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleExport = () => {
    pdfExport.devices(devices, 'Laporan Cepat Perbaikan - Admin');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesData, usersData] = await Promise.all([
          api.devices.list(),
          api.users.list()
        ]);
        setDevices(devicesData);
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { title: 'Total Perbaikan', value: devices.length, icon: Laptop, trend: '+12%', trendUp: true, color: 'blue' as const },
    { title: 'Sedang Diproses', value: devices.filter(d => d.status === 'Diproses').length, icon: Wrench, trend: '+5', trendUp: true, color: 'amber' as const },
    { title: 'Total Pengguna', value: users.length, icon: Users, trend: '+2', trendUp: true, color: 'blue' as const },
    { title: 'Selesai Hari Ini', value: devices.filter(d => d.status === 'Selesai').length, icon: TrendingUp, trend: '+2', trendUp: true, color: 'green' as const },
    { title: 'Menunggu Antrian', value: devices.filter(d => d.status === 'Menunggu').length, icon: AlertCircle, trend: '-3%', trendUp: false, color: 'red' as const },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ringkasan Sistem</h1>
          <p className="text-slate-500 font-medium">Pantau seluruh aktivitas perbaikan dan performa teknisi.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            Export PDF
          </button>
          <button className="bg-repair-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200">
            <Plus className="w-4 h-4" /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Repairs Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Perbaikan Terbaru</h2>
            <button className="text-red-500 text-xs font-bold flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
              </div>
            ) : (
              <DeviceTable devices={devices} />
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Technician Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Status Teknisi</h2>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-6">
              {[
                { name: 'John Doe', tasks: 5, status: 'Online', avatar: 'JD' },
                { name: 'Jane Smith', tasks: 3, status: 'Online', avatar: 'JS' },
                { name: 'Mike Ross', tasks: 0, status: 'Offline', avatar: 'MR' },
              ].map((tech) => (
                <div key={tech.name} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {tech.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{tech.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                      {tech.tasks} Pengerjaan
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${tech.status === 'Online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                </div>
              ))}
              <button className="w-full py-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                Kelola Tim
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-repair-gradient p-6 rounded-[2rem] text-white shadow-xl shadow-red-200">
            <h3 className="font-bold text-lg mb-2">Butuh Bantuan?</h3>
            <p className="text-white/80 text-xs mb-6 leading-relaxed">Punya masalah dengan sistem atau butuh kustomisasi lebih lanjut?</p>
            <button className="w-full py-3 bg-white text-red-600 rounded-xl text-sm font-bold transition-all hover:bg-white/90">
              Hubungi Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
