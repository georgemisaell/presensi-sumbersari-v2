'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Search, Eye, X } from 'lucide-react';
import { updateStatusKetidakhadiran } from './actions';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export interface KetidakhadiranData {
  id: number;
  id_pegawai: number;
  nama_pegawai: string;
  nip: string;
  keterangan: string;
  tanggal: string;
  deskripsi: string;
  file: string;
  status_pengajuan: string;
}

export default function KetidakhadiranClient({ data }: { data: KetidakhadiranData[] }) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState<KetidakhadiranData | null>(null);

  const filteredData = data.filter(item => {
    const matchStatus = filterStatus === 'All' || item.status_pengajuan === filterStatus;
    const matchSearch = item.nama_pegawai.toLowerCase().includes(search.toLowerCase()) || item.nip.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (id: number, newStatus: 'Approved' | 'Rejected') => {
    const loadingToast = toast.loading(`Sedang mengubah status menjadi ${newStatus}...`);
    const res = await updateStatusKetidakhadiran(id, newStatus);
    
    if (res.success) {
      toast.success(`Pengajuan berhasil di-${newStatus}!`, { id: loadingToast });
      if (detailModal) {
        setDetailModal({ ...detailModal, status_pengajuan: newStatus });
      }
    } else {
      toast.error(res.error || 'Terjadi kesalahan', { id: loadingToast });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Disetujui</span>;
      case 'Rejected': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">Ditolak</span>;
      default: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Menunggu</span>;
    }
  };

  const getKeteranganBadge = (ket: string) => {
    switch(ket) {
      case 'Sakit': return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-xs font-semibold border border-red-100">Sakit</span>;
      case 'Izin': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-semibold border border-blue-100">Izin</span>;
      case 'Cuti': return <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-xs font-semibold border border-purple-100">Cuti</span>;
      default: return <span>{ket}</span>;
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Persetujuan Ketidakhadiran</h1>
          <p className="text-slate-500">Tinjau dan kelola surat izin, sakit, atau cuti pegawai.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
              <button 
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === st ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                {st === 'All' ? 'Semua' : st === 'Pending' ? 'Menunggu' : st === 'Approved' ? 'Disetujui' : 'Ditolak'}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama pegawai..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-16 text-center">Tanggal</th>
                <th className="p-4 font-semibold">Pegawai</th>
                <th className="p-4 font-semibold">Keterangan</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada data pengajuan ketidakhadiran.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-center">
                      <div className="font-bold text-slate-700 text-lg">{format(new Date(item.tanggal), 'dd')}</div>
                      <div className="text-xs text-slate-500 uppercase">{format(new Date(item.tanggal), 'MMM yyyy', { locale: idLocale })}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.nama_pegawai}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.nip}</div>
                    </td>
                    <td className="p-4">
                      <div className="mb-1">{getKeteranganBadge(item.keterangan)}</div>
                      <div className="text-sm text-slate-600 truncate max-w-[250px]" title={item.deskripsi}>{item.deskripsi}</div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status_pengajuan)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setDetailModal(item)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors flex items-center justify-center mx-auto"
                        title="Lihat Detail & Bukti"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Detail Pengajuan {detailModal.keterangan}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Diajukan oleh: <span className="font-semibold text-slate-700">{detailModal.nama_pegawai}</span></p>
              </div>
              <button 
                onClick={() => setDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 p-2 rounded-full transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              
              {/* Kolom Kiri: Bukti File */}
              <div className="w-full md:w-1/2 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lampiran Bukti</p>
                <div className="bg-slate-100 rounded-2xl flex-1 min-h-[300px] flex items-center justify-center overflow-hidden border border-slate-200">
                  {detailModal.file ? (
                    <img 
                      src={`/uploads/ketidakhadiran/${detailModal.file}`} 
                      alt="Bukti Ketidakhadiran" 
                      className="max-w-full max-h-[400px] object-contain hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=File+Tidak+Ditemukan';
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">Tidak ada lampiran file</p>
                    </div>
                  )}
                </div>
                {detailModal.file && (
                  <a href={`/uploads/ketidakhadiran/${detailModal.file}`} target="_blank" className="text-center text-xs text-blue-600 hover:underline mt-2 font-medium">Buka gambar di tab baru</a>
                )}
              </div>

              {/* Kolom Kanan: Detail & Aksi */}
              <div className="w-full md:w-1/2 flex flex-col space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="font-medium text-slate-800">{format(new Date(detailModal.tanggal), 'EEEE, dd MMMM yyyy', { locale: idLocale })}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi / Alasan</p>
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm italic border border-slate-100">
                    "{detailModal.deskripsi}"
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Saat Ini</p>
                  <div className="mt-1">{getStatusBadge(detailModal.status_pengajuan)}</div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tindakan Admin</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      disabled={detailModal.status_pengajuan === 'Rejected'}
                      onClick={() => handleUpdateStatus(detailModal.id, 'Rejected')}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> Tolak
                    </button>
                    <button 
                      disabled={detailModal.status_pengajuan === 'Approved'}
                      onClick={() => handleUpdateStatus(detailModal.id, 'Approved')}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" /> Setujui
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
