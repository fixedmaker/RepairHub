import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wrench,
  Search,
  Filter,
  ChevronRight,
  ClipboardList,
  X,
  Loader2,
  Save,
  Calendar as CalendarIcon
} from 'lucide-react';
import { api } from '../../services/api';
import { Device, DeviceStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';

export default function TechnicianDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [updateData, setUpdateData] = useState({
    status: '' as DeviceStatus,
    progress: 0,
    serviceNotes: ''
  });

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const data = await api.devices.list();
      const myDevices = data.filter(d => d.technicianId === user?.id || !d.technicianId);
      setDevices(myDevices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const searchMatch = !searchQuery || 
        device.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.id.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = !statusFilter || device.status === statusFilter;

      let dateMatch = true;
      if (startDate || endDate) {
        try {
          const entryDate = parseISO(device.entryDate);
          dateMatch = isWithinInterval(entryDate, {
            start: startDate ? startOfDay(parseISO(startDate)) : new Date(0),
            end: endDate ? endOfDay(parseISO(endDate)) : new Date(8640000000000000)
          });
        } catch (e) {
          dateMatch = true;
        }
      }

      return searchMatch && statusMatch && dateMatch;
    });
  }, [devices, searchQuery, statusFilter, startDate, endDate]);

  const openUpdateModal = (device: Device) => {
    setSelectedDevice(device);
    setUpdateData({
      status: device.status,
      progress: device.progress,
      serviceNotes: device.serviceNotes || ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    setUpdating(true);
    try {
      await api.devices.update(selectedDevice.id, {
        ...updateData,
        technicianId: user?.id,
        technicianName: user?.name
      });
      setSelectedDevice(null);
      await fetchData();
    } catch (err) {
      alert('Gagal mengupdate perbaikan');
    } finally {
      setUpdating(false);
    }
  };

  const activeCount = devices.filter(d => d.status === 'Diproses').length;
  const pendingCount = devices.filter(d => d.status === 'Menunggu').length;
  const completedCount = devices.filter(d => d.status === 'Selesai').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ruang Kerja Teknisi</h1>
          <p className="text-slate-500 font-medium">Halo, {user?.name}. Selesaikan tugas perbaikan hari ini.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-1 shadow-sm">
          <div className="flex flex-col items-center px-4 py-1 border-r border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Aktif</span>
            <span className="text-lg font-bold text-blue-600">{activeCount}</span>
          </div>
          <div className="flex flex-col items-center px-4 py-1 border-r border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Antre</span>
            <span className="text-lg font-bold text-amber-500">{pendingCount}</span>
          </div>
          <div className="flex flex-col items-center px-4 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Selesai</span>
            <span className="text-lg font-bold text-green-600">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filter & Task List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari unit atau nama pelanggan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  showFilters ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Filter className="w-4 h-4" /> {showFilters ? 'Tutup Filter' : 'Filter'}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label>
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Semua Status</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Tidak Dapat Diperbaiki">Gagal</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tgl Mulai</label>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tgl Akhir</label>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button 
                        onClick={() => {
                          setStatusFilter('');
                          setStartDate('');
                          setEndDate('');
                          setSearchQuery('');
                        }}
                        className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reset Filter
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="col-span-2 bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
                <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-400">Tidak ada tugas perbaikan yang sesuai filter.</p>
              </div>
            ) : (
              filteredDevices.map((device) => (
                <motion.div 
                  key={device.id}
                  whileHover={{ y: -4 }}
                  onClick={() => openUpdateModal(device)}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer overflow-hidden relative group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      device.status === 'Diproses' ? "bg-blue-50 text-blue-600" :
                      device.status === 'Selesai' ? "bg-green-50 text-green-600" :
                      device.status === 'Menunggu' ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {device.status}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(device.entryDate), 'dd MMM')}</span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-1">{device.brand} {device.model}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">{device.customerName} • {device.type}</p>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Pengerjaan</span>
                        <span>{device.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            device.status === 'Selesai' ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ width: `${device.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-lg bg-slate-300 border-2 border-white"></div>
                      </div>
                      <button className="flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-red-500 transition-all">
                        Update Status <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" /> Aktifitas Terakhir
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {[
                { time: '09:30', desc: 'Hardware check Asus ROG', type: 'check' },
                { time: 'Yesterday', desc: 'Selesai perbaikan iPhone 13', type: 'finish' },
                { time: '2 Days ago', desc: 'Menambahkan catatan MacBook Air', type: 'note' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full border-4 border-slate-50 bg-red-500 shadow-sm"></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{log.time}</p>
                    <p className="text-sm font-medium text-slate-700 leading-tight">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
              Semua Riwayat
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold">Tips Cepat</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic mb-4">
              "Jangan lupa untuk mengunggah foto kerusakan barang sebagai dokumentasi pembuktian kepada pelanggan jika diperlukan penggantian sparepart."
            </p>
            <div className="h-1 bg-white/10 rounded-full w-full">
              <div className="h-full bg-red-500 w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="bg-repair-gradient p-8 text-white relative">
                <button 
                  onClick={() => setSelectedDevice(null)}
                  className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Update Progres</h2>
                    <p className="text-white/80 text-sm font-medium">{selectedDevice.brand} {selectedDevice.model}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status Perbaikan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Menunggu', 'Diproses', 'Selesai', 'Tidak Dapat Diperbaiki'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUpdateData({ ...updateData, status: s as DeviceStatus, progress: s === 'Selesai' ? 100 : updateData.progress })}
                          className={cn(
                            "py-2.5 px-4 rounded-xl text-xs font-bold border transition-all",
                            updateData.status === s 
                              ? "bg-red-50 border-red-200 text-red-600 shadow-sm" 
                              : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Tingkat Kemajuan</label>
                      <span className="text-sm font-bold text-red-500">{updateData.progress}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      disabled={updateData.status === 'Selesai'}
                      value={updateData.progress}
                      onChange={(e) => setUpdateData({ ...updateData, progress: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Catatan Servis</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                      placeholder="Tuliskan detail pengecekan atau hasil perbaikan..."
                      value={updateData.serviceNotes}
                      onChange={(e) => setUpdateData({ ...updateData, serviceNotes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedDevice(null)} 
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="flex-1 py-4 bg-repair-gradient text-white rounded-2xl font-bold shadow-lg shadow-red-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

