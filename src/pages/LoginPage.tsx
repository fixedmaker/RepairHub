import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle,
  Terminal,
  Cpu,
  Database,
  Code2,
  Braces,
  Layers,
  Activity,
  Shield,
  Search,
  CheckCircle2,
  Sparkles,
  Server
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import SupportModal from '../components/auth/SupportModal';

// Mock Code Blocks for the Developer Workspace backdrop (Light-theme style)
const BACKGROUND_CODE_SNIPPETS = [
  {
    id: 1,
    title: 'supabase-client.ts',
    content: (
      <>
        <span className="text-pink-600 font-bold">const</span> supabase = <span className="text-sky-600">createClient</span>(
        <br />
        &nbsp;&nbsp;process.env.<span className="text-amber-600">SUPABASE_URL</span>,
        <br />
        &nbsp;&nbsp;process.env.<span className="text-amber-600">SERVICE_KEY</span>
        <br />
        );
      </>
    ),
    x: '8%',
    y: '12%',
    duration: 20,
    delay: 1,
    scale: 0.9,
  },
  {
    id: 2,
    title: 'api-router.ts',
    content: (
      <>
        api.<span className="text-purple-600">patch</span>(<span className="text-emerald-600">"/devices/:id"</span>, <span className="text-pink-600 font-bold">async</span> (req, res) =&gt; &#123;
        <br />
        &nbsp;&nbsp;<span className="text-pink-600 font-bold">const</span> &#123; status &#125; = req.body;
        <br />
        &nbsp;&nbsp;<span className="text-pink-600 font-bold">await</span> db.<span className="text-sky-600">update</span>(status);
        <br />
        &#125;);
      </>
    ),
    x: '78%',
    y: '18%',
    duration: 24,
    delay: 3,
    scale: 0.85,
  },
  {
    id: 3,
    title: 'schema.sql',
    content: (
      <>
        <span className="text-purple-600 font-bold">CREATE TABLE</span> <span className="text-amber-600 font-semibold">users</span> (
        <br />
        &nbsp;&nbsp;id <span className="text-sky-600">uuid</span> <span className="text-pink-600 font-bold">PRIMARY KEY</span>,
        <br />
        &nbsp;&nbsp;name <span className="text-sky-600">text</span> <span className="text-pink-600 font-bold">NOT NULL</span>,
        <br />
        &nbsp;&nbsp;role <span className="text-sky-600">text</span> CHECK (role <span className="text-purple-600">IN</span> (<span className="text-emerald-600">'admin'</span>))
        <br />
        );
      </>
    ),
    x: '10%',
    y: '68%',
    duration: 22,
    delay: 5,
    scale: 0.9,
  },
  {
    id: 4,
    title: 'db-status.json',
    content: (
      <>
        &#123;
        <br />
        &nbsp;&nbsp;<span className="text-pink-600 font-bold">"status"</span>: <span className="text-emerald-600">"connected"</span>,
        <br />
        &nbsp;&nbsp;<span className="text-pink-600 font-bold">"latency"</span>: <span className="text-sky-600">"14ms"</span>,
        <br />
        &nbsp;&nbsp;<span className="text-pink-600 font-bold">"provider"</span>: <span className="text-amber-600">"supabase-postgresql"</span>
        <br />
        &#125;
      </>
    ),
    x: '82%',
    y: '70%',
    duration: 18,
    delay: 2,
    scale: 0.8,
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeLog, setActiveLog] = useState('SYSTEM_BOOT: Web console initialized.');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Simulated code terminal on load
  useEffect(() => {
    const logs = [
      'SYSTEM_BOOT: Web console initialized.',
      'API_CHECK: Establishing handshake with server...',
      'SUPABASE: Listening for secure mutations...',
      'SECURE_LAYER: TLS handshake cert active.',
      'READY: Login terminal state awaiting authentication.'
    ];
    let logIndex = 0;
    const interval = setInterval(() => {
      logIndex = (logIndex + 1) % logs.length;
      setActiveLog(logs[logIndex]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.login({ email, password });
      login(response.user);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-red-200 selection:text-red-900">
      
      {/* 1. Light Tech Grid Background Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)] opacity-80" />

      {/* 2. Cyber Accent Blobs (Floating and Drifting) */}
      <motion.div 
        animate={{ 
          x: [0, 45, -30, 0],
          y: [0, -35, 40, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-12 left-[12%] w-[26rem] h-[26rem] rounded-full bg-red-400/10 blur-[110px] pointer-events-none z-0"
      />
      <motion.div 
        animate={{ 
          x: [0, -40, 50, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.95, 1.15, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-12 right-[12%] w-[32rem] h-[32rem] rounded-full bg-sky-300/10 blur-[130px] pointer-events-none z-0"
      />
      <motion.div 
        animate={{ 
          y: [0, -60, 60, 0],
          scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[22rem] h-[22rem] rounded-full bg-amber-200/5 blur-[95px] pointer-events-none z-0"
      />

      {/* 3. Floating Light Mode Developer Code Blocks */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden z-0">
        {BACKGROUND_CODE_SNIPPETS.map((snippet) => (
          <motion.div
            key={snippet.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: [0.3, 0.55, 0.3],
              y: [0, -25, 25, 0],
              x: [0, 12, -12, 0]
            }}
            transition={{
              y: { duration: snippet.duration, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: snippet.duration * 0.95, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: snippet.delay },
            }}
            style={{ 
              left: snippet.x, 
              top: snippet.y,
              transform: `scale(${snippet.scale || 1})`
            }}
            className="absolute bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-4 shadow-xl max-w-[280px]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono tracking-wide">{snippet.title}</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed text-slate-500 whitespace-pre">
              {snippet.content}
            </pre>
          </motion.div>
        ))}
      </div>

      {/* 4. Floating Tech Badge Elements */}
      <div className="absolute inset-0 pointer-events-none hidden md:block overflow-hidden z-0">
        {[
          { icon: <Terminal className="w-5 h-5 text-red-500" />, x: '24%', y: '12%', rot: 15, delay: 0 },
          { icon: <Database className="w-6 h-6 text-sky-500" />, x: '84%', y: '42%', rot: -20, delay: 1.5 },
          { icon: <Code2 className="w-5 h-5 text-emerald-500" />, x: '16%', y: '52%', rot: 10, delay: 2.5 },
          { icon: <Layers className="w-5 h-5 text-purple-500" />, x: '86%', y: '10%', rot: -10, delay: 1 },
          { icon: <Cpu className="w-6 h-6 text-amber-500" />, x: '66%', y: '82%', rot: 25, delay: 4 },
          { icon: <Activity className="w-5 h-5 text-pink-500" />, x: '32%', y: '82%', rot: -15, delay: 3 }
        ].map((badge, idx) => (
          <motion.div
            key={idx}
            animate={{ 
              y: [0, -18, 18, 0],
              rotate: [badge.rot, badge.rot + 8, badge.rot - 8, badge.rot],
              opacity: [0.25, 0.45, 0.25]
            }}
            transition={{
              duration: 11 + idx * 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: badge.delay
            }}
            style={{ left: badge.x, top: badge.y }}
            className="absolute bg-white/40 border border-slate-200/50 p-3 rounded-xl shadow-md backdrop-blur-md"
          >
            {badge.icon}
          </motion.div>
        ))}
      </div>

      {/* Main Containers Layer */}
      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center relative z-10">
        
        {/* Left Side: Modern Web Developer Information Panel */}
        <div className="lg:col-span-7 hidden lg:flex flex-col space-y-6 text-left max-w-xl pr-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm self-start text-xs font-mono font-bold text-red-500 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            LIVE ENVIRONMENT: PRODUCTION ACTIVE
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Professional <br />
              <span className="bg-clip-text text-transparent bg-repair-gradient">Repair Tracking</span>
              <br />System.
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md font-medium">
              Sistem pelaporan status perbaikan dan sinkronisasi database dinamis yang aman khusus untuk tim teknisi dan administrasi ritel modern.
            </p>
          </motion.div>

          {/* Majestic Dark Terminal emulator for heavy developer aesthetic contrast */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 font-mono text-[11px] space-y-2 shadow-2xl relative text-slate-200"
          >
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>STABLE</span>
            </div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-slate-500 text-[10px] font-bold ml-1">repairhub-console@v2_run</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex gap-2">
                <span className="text-slate-500">Node_env:</span>
                <span className="text-emerald-400">"production"</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">Connection:</span>
                <span className="text-sky-400">"Supabase Postgres DB"</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-slate-500">Session:</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={activeLog}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="text-amber-400 font-bold truncate max-w-[340px]"
                  >
                    {activeLog}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-6 text-slate-400 text-xs font-mono font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-500" /> AES-256 JWT
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-slate-500" /> CLOUD ENGINE
            </span>
          </motion.div>
        </div>

        {/* Right Side: Glassmorphism Light Mode Login Panel */}
        <div className="lg:col-span-5 w-full flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-[440px]"
          >
            {/* Soft pink/red backdrop glow behind card matching index.css brand light gradient */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-200 rounded-[2.5rem] blur-xl opacity-20" />

            {/* Pristine Glass Card */}
            <div className="relative bg-white/85 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(239,68,68,0.12)] p-8 sm:p-10 border border-slate-200/80 text-left">
              
              {/* Header inside card */}
              <div className="text-center mb-8">
                <div className="relative inline-flex mb-5">
                  <div className="absolute -inset-1.5 bg-repair-gradient rounded-2xl blur opacity-30 animate-pulse" />
                  <div className="relative w-14 h-14 bg-repair-gradient rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-red-500/20">
                    R
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Selamat Datang</h1>
                <p className="text-slate-500 mt-2 text-sm font-medium">Masuk ke terminal RepairHub Anda</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold border border-red-100 leading-relaxed"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                    <span className="text-[10px] text-slate-400 font-mono">AUTHORIZED ONLY</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@repairhub.com"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 hover:border-slate-300 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-slate-400 hover:text-slate-700 transition-colors font-mono uppercase focus:outline-none"
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 hover:border-slate-300 transition-all outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-repair-gradient text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-red-400/20 hover:shadow-red-400/30 disabled:opacity-50 disabled:hover:scale-100 text-sm mt-3 font-sans"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Autentikasi...
                    </>
                  ) : 'Masuk ke Sistem'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-xs font-semibold">
                  Belum punya akun resmi?{' '}
                  <span 
                    onClick={() => setIsSupportOpen(true)} 
                    className="text-red-500 hover:text-red-600 hover:underline cursor-pointer transition-colors"
                  >
                    Hubungi Admin
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Support Details Floating Dialog */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}
