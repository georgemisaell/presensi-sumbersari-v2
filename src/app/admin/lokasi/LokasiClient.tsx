'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, MapPin } from 'lucide-react';
import { addLokasi, updateLokasi, deleteLokasi } from './actions';
import toast, { Toaster } from 'react-hot-toast';

export interface LokasiData {
  id: number;
  nama_lokasi: string;
  alamat_lokasi: string;
  tipe_lokasi: string;
  latitude: string;
  longitude: string;
  radius: number;
  zona_waktu: string;
  jam_masuk: string; // HH:mm
  jam_pulang: string; // HH:mm
}

export default function LokasiClient({ data }: { data: LokasiData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<LokasiData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openAddModal = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: LokasiData) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let res;
      if (editData) {
        formData.append('id', editData.id.toString());
        res = await updateLokasi(formData);
      } else {
        res = await addLokasi(formData);
      }

      if (res.success) {
        toast.success(`Lokasi berhasil di${editData ? 'perbarui' : 'tambahkan'}!`);
        closeModal();
      } else {
        toast.error(res.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus lokasi ini? Data pegawai yang terkait dengan lokasi ini mungkin terpengaruh.')) {
      const loadingToast = toast.loading('Menghapus...');
      const res = await deleteLokasi(id);
      if (res.success) {
        toast.success('Lokasi dihapus!', { id: loadingToast });
      } else {
        toast.error(res.error || 'Gagal menghapus', { id: loadingToast });
      }
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lokasi Presensi</h1>
          <p className="text-slate-500">Kelola titik koordinat dan aturan jam kerja.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all active:scale-95 font-medium shrink-0"
        >
          <Plus className="w-5 h-5" />
          Tambah Lokasi
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold">Nama Lokasi</th>
                <th className="p-4 font-semibold">Tipe</th>
                <th className="p-4 font-semibold">Koordinat & Radius</th>
                <th className="p-4 font-semibold">Jam Kerja</th>
                <th className="p-4 font-semibold w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada data lokasi.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{item.nama_lokasi}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]" title={item.alamat_lokasi}>{item.alamat_lokasi}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {item.tipe_lokasi}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700">{item.latitude}, {item.longitude}</div>
                      <div className="text-xs text-slate-500">Radius: {item.radius}m</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700">{item.jam_masuk} - {item.jam_pulang}</div>
                      <div className="text-xs text-slate-500">Zona: {item.zona_waktu}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                {editData ? 'Edit Lokasi Presensi' : 'Tambah Lokasi Presensi'}
              </h3>
              <button 
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Informasi Dasar */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Informasi Dasar</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lokasi</label>
                      <input type="text" name="nama_lokasi" required defaultValue={editData?.nama_lokasi || ''} placeholder="Pusat" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe Lokasi</label>
                      <select name="tipe_lokasi" required defaultValue={editData?.tipe_lokasi || 'Pusat'} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800">
                        <option value="Pusat">Pusat</option>
                        <option value="Cabang">Cabang</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                    <textarea name="alamat_lokasi" required defaultValue={editData?.alamat_lokasi || ''} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"></textarea>
                  </div>
                </div>

                {/* Geofencing */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 mt-2">Geofencing & Peta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Latitude</label>
                      <input type="text" name="latitude" required defaultValue={editData?.latitude || ''} placeholder="-6.12345" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Longitude</label>
                      <input type="text" name="longitude" required defaultValue={editData?.longitude || ''} placeholder="106.12345" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Radius (Meter)</label>
                      <input type="number" name="radius" required defaultValue={editData?.radius || 50} min={10} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                  </div>
                </div>

                {/* Jam Kerja */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 mt-2">Waktu Operasional</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Zona Waktu</label>
                      <select name="zona_waktu" required defaultValue={editData?.zona_waktu || 'WIB'} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800">
                        <option value="WIB">WIB</option>
                        <option value="WITA">WITA</option>
                        <option value="WIT">WIT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Masuk</label>
                      <input type="time" name="jam_masuk" required defaultValue={editData?.jam_masuk || '08:00'} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Pulang</label>
                      <input type="time" name="jam_pulang" required defaultValue={editData?.jam_pulang || '17:00'} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-sm transition-all"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
