'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function LogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Blobs for aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob animation-delay-2000"></div>
      
      <div className="w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-300">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-2xl p-8 text-center">
          
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <LogOut className="w-10 h-10 text-rose-500" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">Konfirmasi Keluar</h1>
          <p className="text-slate-500 mb-8 font-medium">
            Apakah Anda yakin ingin keluar dari aplikasi Presensi Sumbersari?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Ya, Keluar Sekarang
                </>
              )}
            </button>

            <button
              onClick={() => router.back()}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              <X className="w-5 h-5" />
              Batal & Kembali
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
