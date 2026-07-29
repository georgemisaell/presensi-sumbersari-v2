import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PegawaiHomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const idPegawai = parseInt(session.user.id);
  
  // Get pegawai data for lokasi_presensi
  const pegawai = await prisma.pegawai.findUnique({
    where: { id: idPegawai }
  });

  if (!pegawai) {
    return <div>Data pegawai tidak ditemukan.</div>;
  }

  // Get lokasi presensi detail
  const lokasi = await prisma.lokasi_presensi.findFirst({
    where: { nama_lokasi: pegawai.lokasi_presensi }
  });

  if (!lokasi) {
    return <div>Lokasi presensi kantor tidak ditemukan. Hubungi admin.</div>;
  }

  // Check presensi for today
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const presensiHariIni = await prisma.presensi.findFirst({
    where: {
      id_pegawai: idPegawai,
      OR: [
        {
          tanggal_masuk: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        {
          tanggal_masuk: todayUTC
        }
      ]
    },
    orderBy: {
      id: 'desc'
    }
  });


  const formatTimeHHMM = (d: Date) => {
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <DashboardClient 
      lokasi={{
        lat: parseFloat(lokasi.latitude),
        lng: parseFloat(lokasi.longitude),
        radius: lokasi.radius,
        nama: lokasi.nama_lokasi,
        jam_pulang: formatTimeHHMM(lokasi.jam_pulang)
      }}
      presensi={presensiHariIni ? {
        id: presensiHariIni.id,
        waktu_masuk: presensiHariIni.jam_masuk.toISOString(),
        waktu_keluar: presensiHariIni.jam_keluar ? presensiHariIni.jam_keluar.toISOString() : null
      } : null}
    />
  );
}

