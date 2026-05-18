import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Laptop, Plus, Search, Filter, Loader2, Eye, Wrench, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Device, Customer, User, DeviceStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import DeviceTable from '../../components/dashboard/DeviceTable';
import { pdfExport } from '../../utils/pdfExport';
import { cn } from '../../lib/utils';
import { isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { role } = useAuth();

  const handlePrintReceipt = (device: Device) => {
    pdfExport.deviceReceipt(device);
  };
  
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    damageDescription: '',
  });

  const fetchData = async () => {
    try {
      const [devicesData, customersData, usersData] = await Promise.all([
        api.devices.list(),
        api.customers.list(),
        api.users.list()
      ]);
      setDevices(devicesData);
      setCustomers(customersData);
      setTechnicians(usersData.filter(u => u.role === 'technician'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      // Search search
      const searchMatch = !searchQuery || 
        device.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Tech filter
      const techMatch = !techFilter || device.technicianId === techFilter;

      // Status filter
      const statusMatch = !statusFilter || device.status === statusFilter;

      // Date range filter
      let dateMatch = true;
      if (startDate || endDate) {
        const entryDate = parseISO(device.entryDate);
        try {
          dateMatch = isWithinInterval(entryDate, {
            start: startDate ? startOfDay(parseISO(startDate)) : new Date(0),
            end: endDate ? endOfDay(parseISO(endDate)) : new Date(8640000000000000)
          });
        } catch (e) {
          dateMatch = true;
        }
      }

      return searchMatch && techMatch && statusMatch && dateMatch;
    });
  }, [devices, searchQuery, techFilter, statusFilter, startDate, endDate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    try {
      await api.devices.create({
        ...formData,
        customerName: customer.name,
      });
      setIsModalOpen(false);
      setFormData({
        customerId: '',
        type: 'Laptop',
        brand: '',
        model: '',
        serialNumber: '',
        damageDescription: '',
      });
      fetchData();
    } catch (err) {
      alert('Gagal menambah barang');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Semua Barang</h1>
          <p className="text-slate-500 font-medium">Daftar barang perbaikan yang sedang berjalan.</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-repair-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200"
          >
            <Plus className="w-4 h-4" /> Barang Baru
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari unit atau nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
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
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Teknisi</label>
                  <select 
                    value={techFilter}
                    onChange={(e) => setTechFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Semua Teknisi</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
                <div className="md:col-span-4 flex justify-end">
                  <button 
                    onClick={() => {
                      setStatusFilter('');
                      setTechFilter('');
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

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
        ) : (
          <DeviceTable devices={filteredDevices} onPrint={handlePrintReceipt} />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Penerimaan Barang Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pilih Pelanggan</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Jenis Barang</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500"
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
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Merk / Brand</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Contoh: Asus, Apple, Samsung"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Model / Tipe</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Contoh: iPhone 13 Pro"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">No. Seri</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="IMEI atau Serial Number"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Deskripsi Kerusakan</label>
                <textarea 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Ceritakan keluhan barang..."
                  value={formData.damageDescription}
                  onChange={(e) => setFormData({...formData, damageDescription: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-repair-gradient text-white rounded-2xl font-bold shadow-lg shadow-red-200">Terima Barang</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
