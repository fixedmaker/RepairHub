import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { 
  Bell, 
  Search, 
  User, 
  CheckCheck, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Plus, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'critical' | 'info' | 'success' | 'warning';
  read: boolean;
}

const RANDOM_NOTIFICATION_TEMPLATES = [
  {
    title: 'Pembayaran Lunas',
    message: 'HP Oppo Reno 8 (#INV-4412) selesai divalidasi pembayarannya sebesar Rp520.000.',
    category: 'success' as const,
  },
  {
    title: 'Unit Masuk Lab Ritel',
    message: 'Pelanggan baru mendaftarkan perangkat Sony PlayStation 5 dengan keluhan HDD rusak.',
    category: 'info' as const,
  },
  {
    title: 'Kalibrasi Sukses',
    message: 'Teknisi Budi berhasil menguji modul RF pada unit laptop Asus ZenBook Pro.',
    category: 'success' as const,
  },
  {
    title: 'Suhu Kritis Komponen',
    message: 'PC Gaming ROG (#SYS-1090) menunjukkan indikasi thermal throttling di atas 90°C saat stress test.',
    category: 'critical' as const,
  },
  {
    title: 'Estimasi Pengiriman Suku Cadang',
    message: 'Kaca luar pengganti iPad Pro 12.9" masuk estimasi sampai besok siang jam 12.',
    category: 'warning' as const,
  }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('repairhub_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback default
      }
    }
    return [
      {
        id: '1',
        title: 'Suku Cadang Selesai Dipasang',
        message: 'LCD Touchscreen iPhone 13 Pro (#EQ-9021) telah berhasil dipasang & lolos uji mutu.',
        time: '3 menit yang lalu',
        category: 'success',
        read: false,
      },
      {
        id: '2',
        title: 'Calon Teknisi Terdaftar',
        message: 'Agus Hendrawan mengajukan verifikasi pendaftaran akun via loket WhatsApp Support.',
        time: '1 jam yang lalu',
        category: 'info',
        read: false,
      },
      {
        id: '3',
        title: 'Unit Kritis Suku Cadang',
        message: 'MacBook Pro M1 (#EQ-8902) melewati target penyelesaian teknisi rujukan.',
        time: '4 jam yang lalu',
        category: 'critical',
        read: false,
      },
      {
        id: '4',
        title: 'Inden Sparepart Tertunda',
        message: 'Unit Samsung S23 (#EQ-9114) ditangguhkan: IC Power asli inden dari supplier pusat.',
        time: 'Kemarin',
        category: 'warning',
        read: true,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('repairhub_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSimulateNew = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_NOTIFICATION_TEMPLATES.length);
    const template = RANDOM_NOTIFICATION_TEMPLATES[randomIndex];
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title: template.title,
      message: template.message,
      time: 'Baru saja',
      category: template.category,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-100',
          text: 'text-red-700',
          icon: <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-700',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          text: 'text-emerald-700',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50 border-sky-100',
          text: 'text-sky-700',
          icon: <Info className="w-4 h-4 text-sky-500 shrink-0" />
        };
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari perbaikan, barang, atau pelanggan..." 
                className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Bell dropdown wrapper */}
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all relative cursor-pointer"
                aria-label="Notification Center"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Clicking outside overlay */}
              {isOpen && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsOpen(false)} 
                />
              )}

              {/* Notification Center Popover */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px] origin-top-right text-left"
                  >
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-red-400" />
                        <h4 className="font-extrabold text-sm tracking-tight">Notifikasi Sistem</h4>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {unreadCount} Baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSimulateNew}
                          className="bg-white/10 hover:bg-white/20 text-white border border-white/15 p-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="Simulasikan Notifikasi Baru"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">Simulasi</span>
                        </button>
                      </div>
                    </div>

                    {/* Toolbar Actions */}
                    {notifications.length > 0 && (
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 bg-slate-50 px-4 py-2 border-b border-slate-100">
                        <button 
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          Tandai baca semua
                        </button>
                        <button 
                          onClick={clearAllNotifications}
                          className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus semua
                        </button>
                      </div>
                    )}

                    {/* List Group */}
                    <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[340px]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">Tidak ada notifikasi</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Semua aktifitas sistem telah diproses.</p>
                          </div>
                          <button
                            onClick={handleSimulateNew}
                            className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-1.5 text-xs font-bold flex items-center gap-1 hover:bg-red-100 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Buat Simulasi Baru
                          </button>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const theme = getCategoryTheme(notif.category);
                          return (
                            <div 
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 transition-all flex gap-3 hover:bg-slate-50 relative group cursor-pointer ${
                                !notif.read ? 'bg-red-50/15' : ''
                              }`}
                            >
                              {/* Unread Ring indicator */}
                              {!notif.read && (
                                <span className="absolute left-2.5 top-5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                              )}

                              {/* Category Icon */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${theme.bg}`}>
                                {theme.icon}
                              </div>

                              {/* Text content */}
                              <div className="flex-1 space-y-0.5 min-w-0 pr-4">
                                <div className="flex justify-between items-center gap-2">
                                  <h5 className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                                    {notif.title}
                                  </h5>
                                  <span className="text-[9px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                                    {notif.time}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed break-words ${!notif.read ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                                  {notif.message}
                                </p>
                              </div>

                              {/* Hover Close Button to Delete single */}
                              <button
                                onClick={(e) => deleteNotification(notif.id, e)}
                                className="absolute right-3 top-3 p-1 rounded hover:bg-slate-200 text-slate-300 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100"
                                title="Hapus Notifikasi"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Policy line */}
                    <div className="bg-slate-50 p-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-red-500" />
                      RepairHub Real-Time Alert
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border-2 border-white shadow-sm">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
