'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/getImageUrl';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  const [isExporting, setIsExporting] = useState(false);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/rekap?mulai=${mulai}&sampai=${sampai}`);
  };

  const fetchImageAsBuffer = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error("Gagal mendownload gambar", url, error);
      return null;
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    try {
      setIsExporting(true);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekap Absensi');

      // Add Headers
      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Pegawai', key: 'nama', width: 25 },
        { header: 'NIP', key: 'nip', width: 20 },
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'Jam Masuk', key: 'jam_masuk', width: 15 },
        { header: 'Foto Masuk', key: 'foto_masuk', width: 15 }, // Kolom untuk gambar
        { header: 'Jam Keluar', key: 'jam_keluar', width: 15 },
        { header: 'Foto Keluar', key: 'foto_keluar', width: 15 }, // Kolom untuk gambar
        { header: 'Total Jam', key: 'total_jam', width: 15 },
        { header: 'Status', key: 'status', width: 25 },
      ];

      // Style Headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const rowIndex = i + 2; // +1 karena header, +1 karena excel 1-based index

        worksheet.addRow({
          no: i + 1,
          nama: item.nama,
          nip: item.nip,
          tanggal: format(new Date(item.tanggal_masuk), 'dd/MM/yyyy'),
          jam_masuk: format(new Date(item.jam_masuk), 'HH:mm:ss'),
          foto_masuk: '', // Kosongkan text, akan diisi gambar
          jam_keluar: item.jam_keluar ? format(new Date(item.jam_keluar), 'HH:mm:ss') : '-',
          foto_keluar: '', // Kosongkan text
          total_jam: item.total_jam || '-',
          status: item.status
        });

        // Set alignment untuk baris data
        worksheet.getRow(rowIndex).alignment = { vertical: 'middle' };

        // Ubah warna tulisan menjadi merah khusus untuk Jam Masuk jika terlambat
        if (item.status.includes('Terlambat')) {
          worksheet.getCell(`E${rowIndex}`).font = { color: { argb: 'FFFF0000' } };
        }

        // Ubah warna tulisan menjadi merah khusus untuk Jam Keluar jika pulang duluan
        if (item.status.includes('Pulang Duluan')) {
          worksheet.getCell(`G${rowIndex}`).font = { color: { argb: 'FFFF0000' } };
        }

        // Proses Foto Masuk
        if (item.foto_masuk) {
          const buffer = await fetchImageAsBuffer(getImageUrl('presensi', item.foto_masuk));
          if (buffer) {
            const imageId = workbook.addImage({
              buffer: buffer,
              extension: 'jpeg',
            });
            worksheet.addImage(imageId, {
              tl: { col: 5, row: rowIndex - 1 }, // Col 5 = Foto Masuk (0-indexed col), row (0-indexed)
              ext: { width: 80, height: 80 }
            });
            worksheet.getRow(rowIndex).height = 65; // Menyesuaikan tinggi baris
          }
        }

        // Proses Foto Keluar
        if (item.foto_keluar) {
          const buffer = await fetchImageAsBuffer(getImageUrl('presensi', item.foto_keluar));
          if (buffer) {
            const imageId = workbook.addImage({
              buffer: buffer,
              extension: 'jpeg',
            });
            worksheet.addImage(imageId, {
              tl: { col: 7, row: rowIndex - 1 }, // Col 7 = Foto Keluar
              ext: { width: 80, height: 80 }
            });
            if (worksheet.getRow(rowIndex).height < 65) {
              worksheet.getRow(rowIndex).height = 65;
            }
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Rekap_Absensi_${mulai}_sd_${sampai}.xlsx`;
      saveAs(new Blob([buffer]), fileName);

    } catch (error) {
      console.error("Export Error:", error);
      alert("Terjadi kesalahan saat mengekspor Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="print:bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekapitulasi Presensi</h1>
          <p className="text-slate-500">Laporan data kehadiran pegawai berdasarkan periode waktu.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 font-medium shrink-0"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isExporting ? "Memproses..." : "Ekspor Excel"}
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
                  <td colSpan={10} className="p-8 text-center text-slate-400">
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
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-mono text-sm border border-emerald-100">{format(new Date(item.jam_masuk), 'HH:mm:ss')}</span>
                    </td>
                    <td className="p-4 text-center">
                      {item.foto_masuk ? (
                        <a href={getImageUrl('presensi', item.foto_masuk)} target="_blank" rel="noopener noreferrer">
                          <img src={getImageUrl('presensi', item.foto_masuk)} alt="Foto In" className="w-10 h-10 object-cover rounded-lg mx-auto border border-slate-200 hover:scale-110 transition-transform cursor-pointer" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.jam_keluar ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-sm border border-blue-100">{format(new Date(item.jam_keluar), 'HH:mm:ss')}</span>
                      ) : (
                        <span className="text-slate-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.foto_keluar ? (
                        <a href={getImageUrl('presensi', item.foto_keluar)} target="_blank" rel="noopener noreferrer">
                          <img src={getImageUrl('presensi', item.foto_keluar)} alt="Foto Out" className="w-10 h-10 object-cover rounded-lg mx-auto border border-slate-200 hover:scale-110 transition-transform cursor-pointer" />
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
