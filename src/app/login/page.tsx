'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // middleware will handle the redirect, but we can push to root
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-teal-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl p-10 transform transition-all duration-500 hover:scale-[1.01]">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo-kabupaten-madiun.webp" alt="Logo Kabupaten Madiun" className="w-20 h-auto object-contain mb-4 drop-shadow-xl" />
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">PresensiOnline</h1>
            <p className="text-slate-500 mt-2 text-sm text-center font-medium">
              Portal Kehadiran Desa Sumbersari
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center font-medium shadow-sm">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-emerald-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Pemerintahan Desa Sumbersari
          </div>
        </div>
      </div>
    </div>
  );
}
