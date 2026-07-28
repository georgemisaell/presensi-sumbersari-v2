import prisma from '@/lib/prisma';
import PegawaiKetidakhadiranClient from './KetidakhadiranClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PegawaiKetidakhadiranPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'Pegawai') {
    redirect('/login');
  }

  const idPegawai = parseInt(session.user.id);

  const riwayatRaw = await prisma.ketidakhadiran.findMany({
    where: { id_pegawai: idPegawai },
    orderBy: { id: 'desc' }
  });

  const riwayat = riwayatRaw.map(item => ({
    id: item.id,
    keterangan: item.keterangan,
    tanggal: item.tanggal.toISOString(),
    deskripsi: item.deskripsi,
    status_pengajuan: item.status_pengajuan
  }));

  return <PegawaiKetidakhadiranClient riwayat={riwayat} />;
}
