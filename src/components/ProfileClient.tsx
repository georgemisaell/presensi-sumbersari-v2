'use client';

import React, { useState } from 'react';
import { getImageUrl } from '@/lib/getImageUrl';
import { User, Briefcase, MapPin, Phone, Edit3, Key, Loader2, Image as ImageIcon, Home, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { updatePassword } from '@/app/actions/profile';

interface ProfileClientProps {
  user: any;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await updatePassword(formData);
      if (res.success) {
        toast.success('Password berhasil diubah!');
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      toast.error('Gagal menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-slate-500">Lihat informasi biodata Anda dan ubah password akun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Kolom Kiri: Biodata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="px-8 pb-8 pt-16 relative">
              {/* Foto Profil */}
              <div className="absolute -top-16 left-8 p-1 bg-white rounded-full">
                {user.foto && user.foto !== 'default.jpg' ? (
                  <img src={getImageUrl('pegawai', user.foto)} alt={user.nama} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white text-slate-400">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800">{user.nama}</h2>
                <div className="flex flex-wrap items-center gap-2 text-slate-500 font-medium mt-1">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-sm">@{user.username || 'username'}</span>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-sm">{user.nip}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{user.role}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Jabatan</div>
                    <div className="font-semibold text-slate-800">{user.jabatan || '-'}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Lokasi Presensi</div>
                    <div className="font-semibold text-slate-800">{user.lokasi_presensi || '-'}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">No. Handphone</div>
                    <div className="font-semibold text-slate-800">{user.no_handphone || '-'}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Jenis Kelamin</div>
                    <div className="font-semibold text-slate-800">{user.jenis_kelamin || '-'}</div>
                  </div>
                </div>

                <div className="flex gap-4 md:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Alamat</div>
                    <div className="font-semibold text-slate-800">{user.alamat || '-'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Kolom Kanan: Ubah Password */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Ubah Password</h3>
                <p className="text-xs text-slate-500">Pastikan password baru aman.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_baru"
                    required
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ulangi Password Baru</label>
                <div className="relative">
                  <input
                    type={showUlangiPassword ? "text" : "password"}
                    name="ulangi_password_baru"
                    required
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowUlangiPassword(!showUlangiPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showUlangiPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Password'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
