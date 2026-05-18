import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, TrendingUp, Laptop, CheckCircle, Package, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Device } from '../../types';
import StatCard from '../../components/dashboard/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { pdfExport } from '../../utils/pdfExport';

export default function ReportsPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await api.devices.list();
        setDevices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const handleExportAll = () => {
    pdfExport.devices(devices, 'Laporan Keseluruhan Unit Perbaikan');
  };

  const stats = [
    { name: 'Menunggu', count: devices.filter(d => d.status === 'Menunggu').length, color: '#f59e0b' },
    { name: 'Diproses', count: devices.filter(d => d.status === 'Diproses').length, color: '#3b82f6' },
    { name: 'Selesai', count: devices.filter(d => d.status === 'Selesai').length, color: '#10b981' },
    { name: 'Gagal', count: devices.filter(d => d.status === 'Tidak Dapat Diperbaiki').length, color: '#ef4444' },
  ];

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Laporan & Statistik</h1>
          <p className="text-slate-500 font-medium">Analisa data perbaikan dan performa.</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
        >
          <Download className="w-4 h-4" /> Export Semua Laporan (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Servis" value={devices.length} icon={Package} color="blue" />
        <StatCard title="Tingkat Keberhasilan" value={`${((devices.filter(d => d.status === 'Selesai').length / (devices.length || 1)) * 100).toFixed(1)}%`} icon={TrendingUp} color="green" />
        <StatCard title="Pending" value={devices.filter(d => d.status === 'Diproses').length} icon={Laptop} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Status Perbaikan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Kategori Laporan Cepat</h3>
          <div className="space-y-4">
            {[
              { label: 'Barang Masuk Minggu Ini', val: devices.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
              { label: 'Unit Selesai Servis', val: devices.filter(d => d.status === 'Selesai').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
              { label: 'Unit Gagal Perbaiki', val: devices.filter(d => d.status === 'Tidak Dapat Diperbaiki').length, icon: FileText, color: 'bg-red-50 text-red-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">{item.label}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
