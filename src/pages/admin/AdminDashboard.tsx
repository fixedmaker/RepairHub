import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Laptop, 
  Users, 
  Wrench, 
  AlertCircle, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Search,
  X,
  Loader2,
  Save
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import DeviceTable from '../../components/dashboard/DeviceTable';
import DocumentationUpload from '../../components/dashboard/DocumentationUpload';
import { api } from '../../services/api';
import { Device, User, Customer, DeviceStatus } from '../../types';
import { pdfExport } from '../../utils/pdfExport';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    type: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    damageDescription: '',
    technicianId: '',
  });

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [editFormData, setEditFormData] = useState({
    customerId: '',
    type: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    damageDescription: '',
    status: 'Menunggu' as DeviceStatus,
    technicianId: '',
  });

  const handleOpenEdit = (device: Device) => {
    setEditingDevice(device);
    setEditFormData({
      customerId: device.customerId,
      type: device.type,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serialNumber,
      damageDescription: device.damageDescription,
      status: device.status,
      technicianId: device.technicianId || '',
    });
  };

  const handleExport = () => {
    pdfExport.devices(devices, 'Laporan Cepat Perbaikan - Admin');
  };

  const technicians = users.filter(u => u.role === 'technician');

  const fetchData = async () => {
    try {
      const [devicesData, usersData, customersData] = await Promise.all([
        api.devices.list(),
        api.users.list(),
        api.customers.list()
      ]);
      setDevices(devicesData);
      setUsers(usersData);
      setCustomers(customersData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    const selectedTech = technicians.find(t => t.id === formData.technicianId);

    try {
      await api.devices.create({
        ...formData,
        customerName: customer.name,
        technicianId: selectedTech ? selectedTech.id : null,
        technicianName: selectedTech ? selectedTech.name : null,
      });
      setIsModalOpen(false);
      setFormData({
        customerId: '',
        type: 'Laptop',
        brand: '',
        model: '',
        serialNumber: '',
        damageDescription: '',
        technicianId: '',
      });
      await fetchData();
    } catch (err) {
      alert('Gagal menambah barang');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    const customer = customers.find(c => c.id === editFormData.customerId);
    const selectedTech = technicians.find(t => t.id === editFormData.technicianId);

    try {
      await api.devices.update(editingDevice.id, {
        ...editFormData,
        customerName: customer ? customer.name : editingDevice.customerName,
        technicianId: selectedTech ? selectedTech.id : null,
        technicianName: selectedTech ? selectedTech.name : null
      });
      setEditingDevice(null);
      await fetchData();
    } catch (err) {
      alert('Gagal mengupdate barang');
    }
  };

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-repair-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200"
          >
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
              <DeviceTable 
                devices={devices} 
                onPrint={(dev) => pdfExport.deviceReceipt(dev)}
                onView={(dev) => setViewingDevice(dev)}
                onEdit={handleOpenEdit}
              />
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

      {/* Create Device Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-sans">Penerimaan Barang Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">Pilih Pelanggan</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">Jenis Barang</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">Merk / Brand</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                    placeholder="Contoh: Asus, Apple"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">Model / Tipe</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                    placeholder="Contoh: iPhone 13 Pro"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">No. Seri</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                    placeholder="IMEI atau Serial Number"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">Deskripsi Kerusakan</label>
                <textarea 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                  rows={3}
                  placeholder="Ceritakan keluhan barang..."
                  value={formData.damageDescription}
                  onChange={(e) => setFormData({...formData, damageDescription: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 font-sans">Tugaskan Teknisi (Opsional)</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                  value={formData.technicianId}
                  onChange={(e) => setFormData({...formData, technicianId: e.target.value})}
                >
                  <option value="">-- Belum Ditugaskan --</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold font-sans">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-repair-gradient text-white rounded-2xl font-bold shadow-lg shadow-red-200 font-sans">Terima Barang</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm text-left font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-sans">Edit Data Barang</h2>
            <form onSubmit={handleUpdate} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pilih Pelanggan</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  value={editFormData.customerId}
                  onChange={(e) => setEditFormData({...editFormData, customerId: e.target.value})}
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jenis Barang</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Merk / Brand</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Contoh: Asus, Apple"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Model / Tipe</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Contoh: iPhone 13 Pro"
                    value={editFormData.model}
                    onChange={(e) => setEditFormData({...editFormData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">No. Seri</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="IMEI atau Serial Number"
                    value={editFormData.serialNumber}
                    onChange={(e) => setEditFormData({...editFormData, serialNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Deskripsi Kerusakan</label>
                <textarea 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  rows={3}
                  placeholder="Ceritakan keluhan barang..."
                  value={editFormData.damageDescription}
                  onChange={(e) => setEditFormData({...editFormData, damageDescription: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status Progres</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value as DeviceStatus})}
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Tidak Dapat Diperbaiki">Gagal / Tidak Dapat Diperbaiki</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tugaskan Teknisi</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editFormData.technicianId}
                    onChange={(e) => setEditFormData({...editFormData, technicianId: e.target.value})}
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 text-left">
                <DocumentationUpload 
                  device={editingDevice} 
                  onUpdate={async () => {
                    const updatedList = await api.devices.list();
                    setDevices(updatedList);
                    const freshDevice = updatedList.find(d => d.id === editingDevice.id);
                    if (freshDevice) {
                      setEditingDevice(freshDevice);
                    }
                  }} 
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setEditingDevice(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-repair-gradient text-white rounded-2xl font-bold shadow-lg shadow-red-200">Simpan Perubahan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Device Modal */}
      {viewingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm text-left font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative"
          >
            <button 
              onClick={() => setViewingDevice(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Detail Unit Perbaikan</h2>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Informasi Pelanggan</div>
                <p className="text-sm font-bold text-slate-800">{viewingDevice.customerName}</p>
                <p className="text-xs text-slate-500 font-mono">ID: {viewingDevice.customerId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Merk / Model</div>
                  <p className="text-sm font-bold text-slate-800">{viewingDevice.brand} - {viewingDevice.model}</p>
                  <p className="text-xs text-slate-500">{viewingDevice.type}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nomor Seri</div>
                  <p className="text-sm font-semibold text-slate-800 font-mono truncate">{viewingDevice.serialNumber || '-'}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gejala / Kerusakan</div>
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{viewingDevice.damageDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Unit</div>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase tracking-wider",
                    viewingDevice.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                    viewingDevice.status === 'Diproses' ? 'bg-blue-100 text-blue-700' :
                    viewingDevice.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {viewingDevice.status}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Teknisi Penanggungjawab</div>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{viewingDevice.technicianName || 'Belum Ditugaskan'}</p>
                </div>
              </div>

              {viewingDevice.serviceNotes && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
                  <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Catatan Riwayat Servis</div>
                  <p className="text-xs text-amber-800 whitespace-pre-wrap leading-relaxed">{viewingDevice.serviceNotes}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 mt-2 text-left">
                <DocumentationUpload 
                  device={viewingDevice} 
                  onUpdate={async () => {
                    const updatedList = await api.devices.list();
                    setDevices(updatedList);
                    const freshDevice = updatedList.find(d => d.id === viewingDevice.id);
                    if (freshDevice) {
                      setViewingDevice(freshDevice);
                    }
                  }}
                  readOnly={false}
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setViewingDevice(null)} 
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
