'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { addJabatan, updateJabatan, deleteJabatan } from './actions';
import toast, { Toaster } from 'react-hot-toast';

interface JabatanData {
  id: number;
  jabatan: string;
}

export default function JabatanClient({ data }: { data: JabatanData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<JabatanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openAddModal = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: JabatanData) => {
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
        res = await updateJabatan(formData);
      } else {
        res = await addJabatan(formData);
      }

      if (res.success) {
        toast.success(`Jabatan berhasil di${editData ? 'perbarui' : 'tambahkan'}!`);
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
    if (confirm('Yakin ingin menghapus jabatan ini?')) {
      const loadingToast = toast.loading('Menghapus...');
      const res = await deleteJabatan(id);
      if (res.success) {
        toast.success('Jabatan dihapus!', { id: loadingToast });
      } else {
        toast.error(res.error || 'Gagal menghapus', { id: loadingToast });
      }
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Jabatan</h1>
          <p className="text-slate-500">Kelola daftar jabatan untuk pegawai.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5" />
          Tambah Jabatan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Nama Jabatan</th>
                <th className="p-4 font-semibold w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    Belum ada data jabatan.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4 font-medium text-slate-700">{item.jabatan}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editData ? 'Edit Jabatan' : 'Tambah Jabatan'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Jabatan
                </label>
                <input 
                  type="text" 
                  name="jabatan"
                  required
                  defaultValue={editData?.jabatan || ''}
                  placeholder="Contoh: Staff IT"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end">
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
                  {isLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
