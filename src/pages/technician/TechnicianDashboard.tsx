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
  Calendar as CalendarIcon,
  History,
  TrendingUp
} from 'lucide-react';
import { api } from '../../services/api';
import { Device, DeviceStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import TechnicianScratchpad from '../../components/dashboard/TechnicianScratchpad';

export default function TechnicianDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
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

  // Reset status filter when shifting tabs to prevent cross-contamination
  useEffect(() => {
    setStatusFilter('');
  }, [activeTab]);

  const activeDevicesCount = useMemo(() => {
    return devices.filter(d => d.status === 'Menunggu' || d.status === 'Diproses').length;
  }, [devices]);

  const historyDevicesCount = useMemo(() => {
    return devices.filter(d => (d.status === 'Selesai' || d.status === 'Tidak Dapat Diperbaiki') && d.technicianId === user?.id).length;
  }, [devices, user]);

  const unassignedDevices = useMemo(() => {
    return devices.filter(d => !d.technicianId && (d.status === 'Menunggu' || d.status === 'Diproses'));
  }, [devices]);

  const filteredActiveDevices = useMemo(() => {
    return devices.filter(device => {
      const isStatusActive = device.status === 'Menunggu' || device.status === 'Diproses';
      if (!isStatusActive) return false;

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

  const filteredHistoryDevices = useMemo(() => {
    return devices.filter(device => {
      const isHistoryStatus = device.status === 'Selesai' || device.status === 'Tidak Dapat Diperbaiki';
      const isMyDevice = device.technicianId === user?.id;
      if (!isHistoryStatus || !isMyDevice) return false;

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
  }, [devices, searchQuery, statusFilter, startDate, endDate, user]);

  const historyStats = useMemo(() => {
    const myHistory = devices.filter(d => (d.status === 'Selesai' || d.status === 'Tidak Dapat Diperbaiki') && d.technicianId === user?.id);
    const success = myHistory.filter(d => d.status === 'Selesai').length;
    const failed = myHistory.filter(d => d.status === 'Tidak Dapat Diperbaiki').length;
    const total = success + failed;
    const rate = total > 0 ? Math.round((success / total) * 100) : 0;
    return { success, failed, total, rate };
  }, [devices, user]);

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
      const willBeHistory = updateData.status === 'Selesai' || updateData.status === 'Tidak Dapat Diperbaiki';
      await api.devices.update(selectedDevice.id, {
        ...updateData,
        technicianId: user?.id,
        technicianName: user?.name,
        ...(willBeHistory ? { exitDate: new Date().toISOString() } : { exitDate: null })
      });
      setSelectedDevice(null);
      await fetchData();
    } catch (err) {
      alert('Gagal mengupdate perbaikan');
    } finally {
      setUpdating(false);
    }
  };

  const handleClaimDevice = async (device: Device) => {
    try {
      await api.devices.update(device.id, {
        status: 'Diproses',
        progress: 10,
        technicianId: user?.id,
        technicianName: user?.name,
        serviceNotes: 'Klaim unit: Mulai pengerjaan oleh teknisi.'
      });
      await fetchData();
    } catch (err) {
      alert('Gagal mengambil alih unit perbaikan');
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
          {/* Custom Tabs */}
          <div className="flex border-b border-slate-200 bg-white px-6 pt-2 rounded-3xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                "py-4 px-4 font-extrabold text-sm transition-all border-b-2 relative -mb-[1px]",
                activeTab === 'active' 
                  ? "border-red-500 text-slate-900" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>Tugas Aktif & Antrean</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-extrabold",
                  activeTab === 'active' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                )}>
                  {activeDevicesCount}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "py-4 px-4 font-extrabold text-sm transition-all border-b-2 relative -mb-[1px]",
                activeTab === 'history' 
                  ? "border-red-500 text-slate-900" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>Riwayat Perbaikan</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-extrabold",
                  activeTab === 'history' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                )}>
                  {historyDevicesCount}
                </span>
              </div>
            </button>
          </div>

          {/* History Statistics Panel */}
          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-100/60 p-5 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perbaikan Sukses</div>
                  <div className="text-2xl font-black text-slate-800">{historyStats.success} <span className="text-xs text-slate-400 font-bold">unit</span></div>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100/60 p-5 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-md shadow-rose-200">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perbaikan Gagal</div>
                  <div className="text-2xl font-black text-slate-800">{historyStats.failed} <span className="text-xs text-slate-400 font-bold">unit</span></div>
                </div>
              </div>

              <div className="bg-violet-50/40 border border-violet-100/50 p-5 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keberhasilan</div>
                  <div className="text-2xl font-black text-slate-800 mb-1">{historyStats.rate}%</div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full transition-all" style={{ width: `${historyStats.rate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={activeTab === 'active' ? "Cari unit aktif atau nama pelanggan..." : "Cari di arsip riwayat perbaikan..."}
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
                        {activeTab === 'active' ? (
                          <>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                          </>
                        ) : (
                          <>
                            <option value="Selesai">Selesai</option>
                            <option value="Tidak Dapat Diperbaiki">Gagal / Tidak Dapat Diperbaiki</option>
                          </>
                        )}
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

          {/* Cards Area Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
              </div>
            ) : activeTab === 'active' ? (
              filteredActiveDevices.length === 0 ? (
                <div className="col-span-2 bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-bold text-slate-400">Tidak ada tugas perbaikan aktif yang sesuai filter.</p>
                </div>
              ) : (
                filteredActiveDevices.map((device) => (
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
              )
            ) : (
              // Riwayat Perbaikan (History) section cards
              filteredHistoryDevices.length === 0 ? (
                <div className="col-span-2 bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center animate-fade-in">
                  <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-bold text-slate-400">Belum ada riwayat perbaikan selesai atau gagal yang sesuai filter.</p>
                </div>
              ) : (
                filteredHistoryDevices.map((device) => (
                  <motion.div 
                    key={device.id}
                    whileHover={{ y: -4 }}
                    onClick={() => openUpdateModal(device)}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer overflow-hidden relative group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        device.status === 'Selesai' 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      )}>
                        {device.status === 'Selesai' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Selesai</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Gagal</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {device.exitDate ? format(new Date(device.exitDate), 'dd MMM yyyy') : format(new Date(device.entryDate), 'dd MMM')}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 mb-1">{device.brand} {device.model}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">{device.customerName} • {device.type}</p>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Catatan Akhir Servis</div>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-sans whitespace-pre-wrap">
                        {device.serviceNotes || "Tidak ada catatan servis tertulis."}
                      </p>
                    </div>

                    <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-50">
                      <span className="text-[10px] font-mono font-bold text-slate-400">ID: {device.id}</span>
                      <button className="flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-red-500 transition-all">
                        Edit & Detail <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Ringkasan Tugas Saya */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-red-500" /> Ringkasan Kerja Saya
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Diproses</span>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {devices.filter(d => d.status === 'Diproses' && d.technicianId === user?.id).length}
                  <span className="text-xs text-slate-400 font-bold font-sans ml-1">unit</span>
                </div>
              </div>
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/50 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Antre</span>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  {devices.filter(d => d.status === 'Menunggu' && d.technicianId === user?.id).length}
                  <span className="text-xs text-slate-400 font-bold font-sans ml-1">unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buku Catatan & Memo Teknisi (Interactive Scratchpad) */}
          <TechnicianScratchpad userId={user?.id} />

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

