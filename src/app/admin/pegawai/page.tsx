import prisma from '@/lib/prisma';
import PegawaiClient, { PegawaiData } from './PegawaiClient';

export default async function PegawaiPage() {
  const pegawaiDataRaw = await prisma.pegawai.findMany({
    orderBy: { id: 'desc' },
    include: {
      users: {
        select: {
          username: true,
          status: true,
          role: true,
        }
      }
    }
  });

  const listJabatanRaw = await prisma.jabatan.findMany({
    select: { jabatan: true },
    orderBy: { jabatan: 'asc' }
  });

  const listLokasiRaw = await prisma.lokasi_presensi.findMany({
    select: { nama_lokasi: true },
    orderBy: { nama_lokasi: 'asc' }
  });

  const pegawaiData: PegawaiData[] = pegawaiDataRaw as any; // typing shortcut
  const listJabatan = listJabatanRaw.map(j => j.jabatan);
  const listLokasi = listLokasiRaw.map(l => l.nama_lokasi);

  return <PegawaiClient data={pegawaiData} listJabatan={listJabatan} listLokasi={listLokasi} />;
}
