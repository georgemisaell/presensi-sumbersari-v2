import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminClock from '@/components/AdminClock';
import { Users, UserCheck, UserX, UserMinus } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'Admin') {
    redirect('/login');
  }

  const today = new Date();
  const todayWIB = new Date(today.getTime() + (7 * 60 * 60 * 1000));
  const todayUTC = new Date(Date.UTC(todayWIB.getUTCFullYear(), todayWIB.getUTCMonth(), todayWIB.getUTCDate()));

  // 1. Total Pegawai Aktif
  const totalPegawaiAktif = await prisma.users.count({
    where: {
      status: 'Aktif',
      role: 'Pegawai'
    }
  });

  // 2. Jumlah Hadir (Distinct id_pegawai for today's presensi)
  // Group by doesn't support count distinct easily in Prisma, but since presensi is 1 per day per user typically:
  const presensiHadir = await prisma.presensi.findMany({
    where: {
      tanggal_masuk: todayUTC
    },
    select: {
      id_pegawai: true
    },
    distinct: ['id_pegawai']
  });
  const jumlahHadir = presensiHadir.length;

  // 3. Jumlah Sakit, Izin & Cuti
  const ketidakhadiran = await prisma.ketidakhadiran.findMany({
    where: {
      tanggal: todayUTC,
      status_pengajuan: 'Approved' // Asumsi hanya yang disetujui yang dihitung, atau jika tidak ada asumsi, kita hapus status_pengajuan
    },
    select: {
      id_pegawai: true
    },
    distinct: ['id_pegawai']
  });
  const jumlahSakitIzinCuti = ketidakhadiran.length;

  // 4. Jumlah Alpa
  let jumlahAlpa = totalPegawaiAktif - (jumlahHadir + jumlahSakitIzinCuti);
  if (jumlahAlpa < 0) jumlahAlpa = 0;

  const stats = [
    { 
      label: 'Total Pegawai Aktif', 
      value: totalPegawaiAktif, 
      icon: <Users className="w-6 h-6 text-blue-600" />, 
      color: 'bg-blue-100', 
      border: 'border-blue-200' 
    },
    { 
      label: 'Jumlah Hadir', 
      value: jumlahHadir, 
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />, 
      color: 'bg-emerald-100', 
      border: 'border-emerald-200' 
    },
    { 
      label: 'Jumlah Sakit, Izin & Cuti', 
      value: jumlahSakitIzinCuti, 
      icon: <UserMinus className="w-6 h-6 text-amber-600" />, 
      color: 'bg-amber-100', 
      border: 'border-amber-200' 
    },
    { 
      label: 'Jumlah Alpa', 
      value: jumlahAlpa, 
      icon: <UserX className="w-6 h-6 text-rose-600" />, 
      color: 'bg-rose-100', 
      border: 'border-rose-200' 
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      
      {/* Welcome & Clock Section */}
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-60"></div>
        
        <div className="relative z-10 text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Selamat datang, {session.user.nama || 'Admin'}!</h1>
          <p className="text-slate-500">Berikut adalah ringkasan kehadiran pegawai hari ini.</p>
        </div>

        <div className="relative z-10">
          <AdminClock />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${stat.color} ${stat.border} transition-transform group-hover:scale-110`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
