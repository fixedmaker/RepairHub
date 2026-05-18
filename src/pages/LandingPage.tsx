import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  Smartphone, 
  LineChart, 
  ArrowRight,
  Monitor,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-repair-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight">RepairHub</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-red-500 transition-colors">Fitur</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-red-500 transition-colors">Tentang</a>
          </div>

          <Link 
            to="/login"
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-600 transition-all duration-300 shadow-lg shadow-slate-200"
          >
            Masuk Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest mb-6">
              Sistem Manajemen Perbaikan Digital #1
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tighter">
              Kelola Servis <br />
              <span className="text-gradient">Lebih Profesional.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Automasi proses perbaikan barang digital Anda dengan RepairHub. Tracking status real-time, manajemen teknisi, dan laporan otomatis dalam satu platform modern.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/login"
                className="bg-repair-gradient text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-red-200"
              >
                Mulai Uji Coba <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login"
                className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
              >
                Mulai Sekarang
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-red-500" /> Multi-user Access
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-red-500" /> Real-time Tracking
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-200 rounded-3xl blur-3xl opacity-20 -rotate-6"></div>
            <div className="relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <Monitor className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Track Kemajuan</h3>
                  <p className="text-xs text-slate-500">Monitor status perbaikan secara otomatis.</p>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <Smartphone className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="font-bold text-red-900 mb-2">Notifikasi Cepat</h3>
                  <p className="text-xs text-red-600/70">Update real-time kepada pelanggan.</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl col-span-2 flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-bold mb-1 text-lg">Digitalisasi Servis</h3>
                    <p className="text-sm text-slate-400">Gantikan catatan manual dengan sistem cloud.</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <LineChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Repair Success Rate</p>
                  <p className="text-xl font-bold text-slate-900">98.4%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-16 tracking-tight">Manfaat Digitalisasi dengan RepairHub</h2>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            {[
              { 
                icon: ShieldCheck, 
                title: "Keamanan Data", 
                desc: "Seluruh data pelanggan dan riwayat servis tersimpan aman dengan enkripsi tingkat tinggi." 
              },
              { 
                icon: Clock, 
                title: "Efisien & Cepat", 
                desc: "Kurangi waktu administrasi hingga 60% dengan workflow perbaikan yang terstruktur." 
              },
              { 
                icon: Smartphone, 
                title: "Kepuasan Pelanggan", 
                desc: "Pelanggan mendapatkan transparansi status pengerjaan yang meningkatkan kepercayaan." 
              }
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px]"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Misi Kami: Memodernisasi Industri Servis Lokal</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  RepairHub hadir dari kebutuhan akan sistem yang lebih transparan dan efisien. Kami percaya bahwa setiap bengkel servis, dari skala kecil hingga besar, berhak memiliki akses ke teknologi kelas dunia.
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-center bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[120px]">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mitra Bengkel</div>
                  </div>
                  <div className="text-center bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[120px]">
                    <div className="text-2xl font-bold text-white">10k+</div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Unit Selesai</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>
                  <div className="h-60 bg-red-500/20 rounded-2xl border border-red-500/20"></div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-60 bg-white/10 rounded-2xl border border-white/10"></div>
                  <div className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">R</div>
            <span className="font-bold text-white text-lg">RepairHub</span>
          </div>
          <p>© 2026 RepairHub. Digitalizing your service business. Made with Heart.</p>
        </div>
      </footer>
    </div>
  );
}
