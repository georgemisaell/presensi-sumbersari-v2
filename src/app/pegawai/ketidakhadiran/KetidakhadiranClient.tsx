'use client';

import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { submitKetidakhadiran } from './actions';
import toast, { Toaster } from 'react-hot-toast';

export interface RiwayatData {
  id: number;
  keterangan: string;
  tanggal: string;
  deskripsi: string;
  status_pengajuan: string;
}

export default function PegawaiKetidakhadiranClient({ riwayat }: { riwayat: RiwayatData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await submitKetidakhadiran(formData);
      if (res.success) {
        toast.success(`Pengajuan berhasil dikirim!`);
        setIsModalOpen(false);
      } else {
        toast.error(res.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Disetujui</span>;
      case 'Rejected': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">Ditolak</span>;
      default: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Menunggu</span>;
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Ketidakhadiran</h1>
          <p className="text-slate-500">Ajukan surat dokter, cuti, atau izin tidak masuk.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 font-medium shrink-0"
        >
          <Plus className="w-5 h-5" />
          Buat Pengajuan
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Jenis</th>
                <th className="p-4 font-semibold">Deskripsi</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Anda belum memiliki riwayat pengajuan.
                  </td>
                </tr>
              ) : (
                riwayat.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4 font-medium text-slate-800">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 font-semibold text-blue-600">{item.keterangan}</td>
                    <td className="p-4 text-slate-600 text-sm">{item.deskripsi}</td>
                    <td className="p-4 text-center">{getStatusBadge(item.status_pengajuan)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengajuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">
                Form Pengajuan
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 p-2 rounded-full transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Ketidakhadiran</label>
                <select name="keterangan" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Cuti">Cuti</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
                <input type="date" name="tanggal" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Alasan / Deskripsi Lengkap</label>
                <textarea name="deskripsi" required rows={3} placeholder="Sakit demam berdarah..." className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unggah Bukti (Surat Dokter / Dokumen)</label>
                <input 
                  type="file" 
                  name="file" 
                  accept="image/*" 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl shadow-sm transition-all"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
