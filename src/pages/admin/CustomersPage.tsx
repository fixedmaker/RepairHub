import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserCircle, Plus, Phone, Mail, MapPin, Loader2, Search } from 'lucide-react';
import { api } from '../../services/api';
import { Customer } from '../../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  const fetchCustomers = async () => {
    try {
      const data = await api.customers.list();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.customers.create(formData);
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (err) {
      alert('Gagal menambah pelanggan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Data Pelanggan</h1>
          <p className="text-slate-500 font-medium">Manajemen riwayat kontak pelanggan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-repair-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200"
        >
          <Plus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-8 py-4">Pelanggan</th>
                <th className="px-8 py-4">Kontak</th>
                <th className="px-8 py-4">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-slate-900">{customer.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3 h-3" /> {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3 h-3" /> {customer.email || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-start gap-2 text-xs text-slate-500 max-w-xs">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{customer.address || 'Tidak ada alamat'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tambah Pelanggan Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Pelanggan</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">No. HP</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email (Opsional)</label>
                <input 
                  type="email"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Alamat</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-repair-gradient text-white rounded-2xl font-bold shadow-lg shadow-red-200">Simpan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
