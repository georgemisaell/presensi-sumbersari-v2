'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export interface RekapData {
  id: number;
  nama: string;
  nip: string;
  tanggal_masuk: string;
  jam_masuk: string;
  jam_keluar: string | null;
  foto_masuk: string | null;
  foto_keluar: string | null;
  total_jam: string | null;
  total_terlambat: number;
  status: string; // Hadir, Terlambat, dll
}

export default function RekapClient({ data, initialMulai, initialSampai }: { data: RekapData[], initialMulai: string, initialSampai: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mulai, setMulai] = useState(initialMulai);
  const [sampai, setSampai] = useState(initialSampai);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/rekap?mulai=${mulai}&sampai=${sampai}`);
  };

  const handleCetak = () => {
    // Di masa depan bisa trigger Print Window atau generate PDF/Excel
    window.print();
  };

  return (
    <div className="print:bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekapitulasi Presensi</h1>
          <p className="text-slate-500">Laporan data kehadiran pegawai berdasarkan periode waktu.</p>
        </div>
        <button 
          onClick={handleCetak}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 font-medium shrink-0"
        >
          <Download className="w-5 h-5" />
          Cetak / Ekspor
        </button>
      </div>

      {/* Header Print Only */}
      <div className="hidden print:block text-center mb-8">
        <h2 className="text-2xl font-bold uppercase">Laporan Presensi Pegawai</h2>
        <p>Periode: {format(new Date(initialMulai), 'dd MMM yyyy', { locale: idLocale })} s.d. {format(new Date(initialSampai), 'dd MMM yyyy', { locale: idLocale })}</p>
        <hr className="mt-4 border-2 border-black" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
        
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Dari Tanggal</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  value={mulai}
                  onChange={e => setMulai(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-800"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  value={sampai}
                  onChange={e => setSampai(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-800"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm font-medium h-[38px]"
            >
              <Filter className="w-4 h-4" /> Filter Data
            </button>
          </form>
        </div>

        {/* Tabel Rekap */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] print:text-sm">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-600 text-sm print:border-black">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Nama Pegawai</th>
                <th className="p-4 font-semibold text-center">Tanggal</th>
                <th className="p-4 font-semibold text-center">Jam Masuk</th>
                <th className="p-4 font-semibold text-center">Foto In</th>
                <th className="p-4 font-semibold text-center">Jam Keluar</th>
                <th className="p-4 font-semibold text-center">Foto Out</th>
                <th className="p-4 font-semibold text-center">Total Jam</th>
                <th className="p-4 font-semibold text-center">Keterlambatan</th>
                <th className="p-4 font-semibold text-center print:hidden">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada rekaman absensi pada periode ini.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors print:border-b-gray-300">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.nama}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.nip}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-medium text-slate-700">{format(new Date(item.tanggal_masuk), 'dd/MM/yyyy')}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-mono text-sm border border-emerald-100">{item.jam_masuk}</span>
                    </td>
                    <td className="p-4 text-center">
                      {item.foto_masuk ? (
                        <a href={`/uploads/presensi/${item.foto_masuk}`} target="_blank" rel="noopener noreferrer">
                          <img src={`/uploads/presensi/${item.foto_masuk}`} alt="Foto In" className="w-10 h-10 object-cover rounded-lg mx-auto border border-slate-200 hover:scale-110 transition-transform cursor-pointer" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.jam_keluar ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-sm border border-blue-100">{item.jam_keluar}</span>
                      ) : (
                        <span className="text-slate-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.foto_keluar ? (
                        <a href={`/uploads/presensi/${item.foto_keluar}`} target="_blank" rel="noopener noreferrer">
                          <img src={`/uploads/presensi/${item.foto_keluar}`} alt="Foto Out" className="w-10 h-10 object-cover rounded-lg mx-auto border border-slate-200 hover:scale-110 transition-transform cursor-pointer" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-medium text-slate-700">
                      {item.total_jam || <span className="text-slate-400 italic text-xs">-</span>}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {item.total_terlambat > 0 ? (
                        <span className="text-rose-600">{item.total_terlambat} mnt</span>
                      ) : (
                        <span className="text-emerald-600">Tepat Waktu</span>
                      )}
                    </td>
                    <td className="p-4 text-center print:hidden">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Terlambat' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
