'use client';

import React, { useState } from 'react';
import { Plus, Trash2, X, Users, Image as ImageIcon, Edit2 } from 'lucide-react';
import { getImageUrl } from '@/lib/getImageUrl';
import { addPegawai, deletePegawai, updatePegawai } from './actions';
import toast, { Toaster } from 'react-hot-toast';

export interface PegawaiData {
  id: number;
  nip: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  no_handphone: string;
  jabatan: string;
  lokasi_presensi: string;
  foto: string;
  users: {
    username: string;
    status: string;
    role: string;
  }[];
}

interface PegawaiClientProps {
  data: PegawaiData[];
  listJabatan: string[];
  listLokasi: string[];
}

export default function PegawaiClient({ data, listJabatan, listLokasi }: PegawaiClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState<PegawaiData | null>(null);

  const openAddModal = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PegawaiData) => {
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
      const res = editData 
        ? await updatePegawai(editData.id, formData)
        : await addPegawai(formData);

      if (res.success) {
        toast.success(`Pegawai berhasil ${editData ? 'diperbarui' : 'ditambahkan'}!`);
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
    if (confirm('Yakin ingin menghapus pegawai ini? Akun login mereka juga akan terhapus.')) {
      const loadingToast = toast.loading('Menghapus...');
      const res = await deletePegawai(id);
      if (res.success) {
        toast.success('Pegawai dihapus!', { id: loadingToast });
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
          <h1 className="text-2xl font-bold text-slate-800">Data Pegawai</h1>
          <p className="text-slate-500">Kelola daftar pegawai dan akun akses sistem.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all active:scale-95 font-medium shrink-0"
        >
          <Plus className="w-5 h-5" />
          Tambah Pegawai
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold">Pegawai</th>
                <th className="p-4 font-semibold">Posisi & Lokasi</th>
                <th className="p-4 font-semibold">Kontak & Alamat</th>
                <th className="p-4 font-semibold">Akun Login</th>
                <th className="p-4 font-semibold w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada data pegawai.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const user = item.users[0];
                  return (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-center text-slate-500">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.foto && item.foto !== 'default.jpg' ? (
                            <img src={getImageUrl('pegawai', item.foto)} alt={item.nama} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800">{item.nama}</div>
                            <div className="text-xs font-mono text-slate-500">{item.nip}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{item.jenis_kelamin}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{item.jabatan}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {item.lokasi_presensi}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700">{item.no_handphone}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]" title={item.alamat}>{item.alamat}</div>
                      </td>
                      <td className="p-4">
                        {user ? (
                          <>
                            <div className="text-sm font-semibold text-slate-700">@{user.username}</div>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>{user.role}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{user.status}</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-rose-500 font-medium italic">Tidak ada akun</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                {editData ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button 
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1" encType="multipart/form-data">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bagian Kiri: Data Pribadi & Pekerjaan */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">Biodata & Posisi</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" name="nama" defaultValue={editData?.nama} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select name="jenis_kelamin" defaultValue={editData?.jenis_kelamin || ''} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800">
                        <option value="">-- Pilih --</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">No. Handphone</label>
                      <input type="text" name="no_handphone" defaultValue={editData?.no_handphone} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
                    <textarea name="alamat" required rows={2} defaultValue={editData?.alamat} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jabatan</label>
                      <select name="jabatan" defaultValue={editData?.jabatan || ''} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800">
                        <option value="">-- Pilih Jabatan --</option>
                        {listJabatan.map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Lokasi Presensi</label>
                      <select name="lokasi_presensi" defaultValue={editData?.lokasi_presensi || ''} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800">
                        <option value="">-- Pilih Lokasi --</option>
                        {listLokasi.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Foto Profil {editData && '(Biarkan kosong jika tidak diubah)'}</label>
                    <input type="file" name="foto" accept="image/*" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-slate-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                </div>

                {/* Bagian Kanan: Akun Akses */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2">Akun Sistem (Login)</h4>
                  
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-900 mb-1">Username</label>
                      <input type="text" name="username" defaultValue={editData?.users[0]?.username} required className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-900 font-medium" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-1">Password {editData && '(Kosong = Tetap)'}</label>
                        <input type="password" name="password" required={!editData} className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-900 font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-1">Ulangi Password</label>
                        <input type="password" name="ulangi_password" required={!editData} className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-900 font-medium" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-1">Role Akses</label>
                        <select name="role" defaultValue={editData?.users[0]?.role || 'Pegawai'} required className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-emerald-900 font-medium">
                          <option value="Pegawai">Pegawai</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-1">Status Akun</label>
                        <select name="status" defaultValue={editData?.users[0]?.status || 'Aktif'} required className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-emerald-900 font-medium">
                          <option value="Aktif">Aktif</option>
                          <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 mt-4 p-3 bg-slate-50 rounded-lg">
                    <strong>Catatan:</strong> NIP akan di-generate secara otomatis oleh sistem (contoh: PEG-0012) ketika Anda menekan tombol simpan.
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
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {isLoading && <span className="animate-spin text-xl leading-none">⍥</span>}
                  {isLoading ? 'Memproses Data...' : editData ? 'Simpan Perubahan' : 'Simpan Pegawai Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
