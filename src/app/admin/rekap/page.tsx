import prisma from '@/lib/prisma';
import RekapClient, { RekapData } from './RekapClient';
import { format } from 'date-fns';

export default async function RekapPage({
  searchParams
}: {
  searchParams: { mulai?: string; sampai?: string };
}) {
  const today = new Date();
  
  // Default filter: Tanggal hari ini s.d. hari ini
  const filterMulai = searchParams.mulai || format(today, 'yyyy-MM-dd');
  const filterSampai = searchParams.sampai || format(today, 'yyyy-MM-dd');

  const startDate = new Date(filterMulai);
  const endDate = new Date(filterSampai);
  // Add 1 day to end date to include the entire day
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  const dataRaw = await prisma.presensi.findMany({
    where: {
      tanggal_masuk: {
        gte: startDate,
        lt: endDatePlusOne
      }
    },
    orderBy: [
      { tanggal_masuk: 'desc' },
      { jam_masuk: 'desc' }
    ]
  });

  const idPegawaiList = Array.from(new Set(dataRaw.map(d => d.id_pegawai)));
  
  const pegawaiList = await prisma.pegawai.findMany({
    where: {
      id: { in: idPegawaiList }
    },
    select: { id: true, nama: true, nip: true }
  });

  const pegawaiMap = new Map(pegawaiList.map(p => [p.id, p]));

  const mappedData: RekapData[] = dataRaw.map(item => {
    const peg = pegawaiMap.get(item.id_pegawai);
    return {
      id: item.id,
      nama: peg ? peg.nama : 'Unknown',
      nip: peg ? peg.nip : '-',
      tanggal_masuk: item.tanggal_masuk.toISOString(),
      jam_masuk: format(item.jam_masuk, 'HH:mm:ss'),
      jam_keluar: item.jam_keluar ? format(item.jam_keluar, 'HH:mm:ss') : null,
      status: 'Hadir'
    };
  });

  return <RekapClient data={mappedData} initialMulai={filterMulai} initialSampai={filterSampai} />;
}
