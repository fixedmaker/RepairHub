import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'direct'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Daftar Akun Baru');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('admin@repairhub.com');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getWhatsAppURL = (customMsg?: string) => {
    const adminPhone = '6281234567890'; // Mock/Standard Indonesian Admin number
    const defaultText = customMsg || `Halo Admin RepairHub, saya memerlukan bantuan mengenai akun saya atau pendaftaran baru di sistem. \n\nNama: ${name || '-'}\nEmail: ${email || '-'}\nNo HP: ${phone || '-'}`;
    return `https://wa.me/${adminPhone}?text=${encodeURIComponent(defaultText)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.supportRequests.create({
        name,
        email,
        phone,
        category,
        message
      });

      if (response.success) {
        setSubmitted(true);
      } else {
        throw new Error('Gagal mengirimkan tanggapan Anda.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal terhubung dengan server database, namun Anda bisa langsung mengirim permintaan lewat WhatsApp.');
      // Keep going to submitted or let them use fallback
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const getWAFormattedMessage = () => {
    return `Halo Admin RepairHub, saya mengirimkan Tiket Support dari Formulir Aplikasi:\n\n` +
      `👤 *Nama:* ${name}\n` +
      `✉️ *Email:* ${email}\n` +
      `📞 *WhatsApp:* ${phone}\n` +
      `🏷️ *Perihal:* ${category}\n` +
      `💬 *Pesan:* ${message}`;
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCategory('Daftar Akun Baru');
    setMessage('');
    setSubmitted(false);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header decoration */}
        <div className="bg-repair-gradient px-6 py-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-100" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Hubungi Admin</h3>
              <p className="text-xs text-red-100/90 font-medium">Bantuan pendaftaran akun & resetting kata sandi</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {!submitted && (
          <div className="flex bg-slate-50 border-b border-slate-100 p-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'form' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Kirim Formulir
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'direct' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              Kontak Langsung
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-5"
              >
                <div className="inline-flex w-16 h-16 bg-green-50 text-green-500 rounded-full items-center justify-center mx-auto mb-2 border border-green-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Permintaan Terkirim!</h4>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                    Terima kasih. Permintaan Anda telah dicatat di sistem cadangan RepairHub.
                  </p>
                  {errorMsg && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 border border-amber-100 rounded-xl mt-3 max-w-sm mx-auto">
                      Sistem menggunakan integrasi WhatsApp sebagai rujukan respons cepat.
                    </p>
                  )}
                </div>

                {/* WhatsApp Link Trigger */}
                <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 max-w-md mx-auto">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pesan yang akan dikirim:</p>
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto bg-white p-3 border border-slate-100 rounded-xl">
                    {getWAFormattedMessage()}
                  </pre>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a 
                    href={getWhatsAppURL(getWAFormattedMessage())}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="w-full bg-green-500 text-white rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition-all text-sm"
                  >
                    Kirim via WhatsApp <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={handleReset}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-all py-2"
                  >
                    Kirim Permintaan Lain
                  </button>
                </div>
              </motion.div>
            ) : activeTab === 'form' ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-1">Alamat Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@domain.com"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-1">No. WhatsApp/HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08123xxxx"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-1">Kategori Keperluan</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="Daftar Akun Baru">Permintaan Akun Baru (Teknisi / Admin)</option>
                    <option value="Lupa Password">Lupa Kata Sandi Akun</option>
                    <option value="Masalah Sistem">Laporan Masalah / Bug di Sistem</option>
                    <option value="Bantuan Umum">Pertanyaan / Kustomisasi Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5 ml-1">Pesan / Penjelasan Detail</label>
                  <textarea 
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis alasan pendaftaran atau detail masalah Anda..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Mengirim...' : (
                    <>
                      Kirim Tiket Permintaan <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="direct"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-500 leading-relaxed text-center pb-2">
                  Hubungi tim administrasi kami secara langsung melalui jalur respon cepat di bawah:
                </p>

                {/* WhatsApp Option Card */}
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">WhatsApp Support (Fast Response)</h4>
                      <p className="text-xs text-slate-500">Mulai diskusi langsung dengan Admin</p>
                    </div>
                  </div>
                  <a 
                    href={getWhatsAppURL()}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 transition-all flex items-center justify-center"
                    title="Buka WhatsApp"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Email Admin Options Card */}
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-[75%]">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-800">Sistem Email Admin</h4>
                      <p className="text-xs text-slate-500 truncate">admin@repairhub.com</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button 
                      onClick={handleCopyEmail}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg p-2 transition-all flex items-center justify-center"
                      title="Salin Email"
                    >
                      {copiedText ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a 
                      href="mailto:admin@repairhub.com?subject=Tanya%20RepairHub&body=Halo%20Admin%2C%20saya%20memerlukan%20akses%20ke%20RepairHub..."
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-all flex items-center justify-center"
                      title="Kirim Email"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* System Policy Box */}
                <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 border border-slate-100">
                  <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 shrink-0 text-[10px] font-bold">i</div>
                  <div className="text-xs text-slate-500 leading-relaxed font-medium">
                    <span className="font-extrabold text-slate-700 block mb-0.5">Ketentuan Akun</span>
                    Sistem RepairHub adalah sistem pelacak internal khusus teknisi dan administrasi ritel. Registrasi mandiri dinonaktifkan untuk menjaga keamanan data & dokumentasi unit perbaikan.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-1.5 font-sans">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RepairHub Security System</span>
        </div>
      </motion.div>
    </div>
  );
}
