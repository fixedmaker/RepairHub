import { Device } from '../../types';
import { cn } from '../../lib/utils';
import { MoreHorizontal, Eye, Edit2, Calendar, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface DeviceTableProps {
  devices: Device[];
  onView?: (device: Device) => void;
  onEdit?: (device: Device) => void;
  onPrint?: (device: Device) => void;
}

export default function DeviceTable({ devices, onView, onEdit, onPrint }: DeviceTableProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Menunggu': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Diproses': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Selesai': return 'bg-green-50 text-green-600 border-green-100';
      case 'Tidak Dapat Diperbaiki': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">
            <th className="px-6 py-4">Barang & Pelanggan</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Teknisi</th>
            <th className="px-6 py-4">Tgl Masuk</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {devices.map((device) => (
            <tr key={device.id} className="group bg-white hover:bg-slate-50 transition-all border border-slate-100">
              <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-100 group-hover:border-slate-200">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{device.type} {device.brand}</span>
                  <span className="text-xs text-slate-500 font-medium">{device.customerName}</span>
                </div>
              </td>
              <td className="px-6 py-5 border-y border-slate-100 group-hover:border-slate-200">
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border", getStatusStyles(device.status))}>
                  {device.status}
                </span>
              </td>
              <td className="px-6 py-5 border-y border-slate-100 group-hover:border-slate-200">
                <div className="text-sm text-slate-700 font-medium">
                  {device.technicianName || '-'}
                </div>
              </td>
              <td className="px-6 py-5 border-y border-slate-100 group-hover:border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(device.entryDate), 'dd MMM yyyy')}
                </div>
              </td>
              <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-100 group-hover:border-slate-200 text-right">
                <div className="flex items-center justify-end gap-2 text-slate-400">
                  <button 
                    onClick={() => onPrint?.(device)} 
                    className="p-2 hover:bg-white hover:text-orange-500 rounded-lg transition-all"
                    title="Cetak Tanda Terima"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => onView?.(device)} className="p-2 hover:bg-white hover:text-blue-500 rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit?.(device)} className="p-2 hover:bg-white hover:text-red-500 rounded-lg transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white hover:text-slate-900 rounded-lg transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
