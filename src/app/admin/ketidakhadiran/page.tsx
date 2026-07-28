import prisma from '@/lib/prisma';
import KetidakhadiranClient, { KetidakhadiranData } from './KetidakhadiranClient';
import { format } from 'date-fns';

export default async function KetidakhadiranPage() {
  const dataRaw = await prisma.ketidakhadiran.findMany({
    orderBy: { id: 'desc' }
  });

  const idPegawaiList = Array.from(new Set(dataRaw.map(d => d.id_pegawai)));
  
  const pegawaiList = await prisma.pegawai.findMany({
    where: {
      id: { in: idPegawaiList }
    },
    select: { id: true, nama: true, nip: true }
  });

  const pegawaiMap = new Map(pegawaiList.map(p => [p.id, p]));

  const mappedData: KetidakhadiranData[] = dataRaw.map(item => {
    const peg = pegawaiMap.get(item.id_pegawai);
    return {
      id: item.id,
      id_pegawai: item.id_pegawai,
      nama_pegawai: peg ? peg.nama : 'Unknown',
      nip: peg ? peg.nip : '-',
      keterangan: item.keterangan,
      tanggal: item.tanggal.toISOString(),
      deskripsi: item.deskripsi,
      file: item.file,
      status_pengajuan: item.status_pengajuan
    };
  });

  return <KetidakhadiranClient data={mappedData} />;
}
