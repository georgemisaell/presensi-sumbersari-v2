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

  const lokasiList = await prisma.lokasi_presensi.findMany();
  const lokasiMap = new Map(lokasiList.map(l => [l.nama_lokasi, l]));

  const mappedData: RekapData[] = dataRaw.map(item => {
    const peg = pegawaiMap.get(item.id_pegawai);
    const lokasi = peg ? lokasiMap.get(peg.lokasi_presensi) : null;

    const jamMasukStr = item.jam_masuk.toISOString().substring(11, 19);
    const jamKeluarStr = item.jam_keluar ? item.jam_keluar.toISOString().substring(11, 19) : null;

    let total_terlambat = 0;
    let status = 'Hadir';

    if (lokasi) {
      const actualMasukMs = item.jam_masuk.getTime();
      const targetMasukMs = lokasi.jam_masuk.getTime();
      const diffMinutes = Math.floor((actualMasukMs - targetMasukMs) / 60000);
      if (diffMinutes > 0) {
        total_terlambat = diffMinutes;
        status = 'Terlambat';
      }
    }

    let total_jam = null;
    if (item.jam_keluar) {
      const workedMs = item.jam_keluar.getTime() - item.jam_masuk.getTime();
      const workedMinutes = Math.floor(workedMs / 60000);
      const hours = Math.floor(workedMinutes / 60);
      const mins = workedMinutes % 60;
      total_jam = `${hours}j ${mins}m`;
    }

    return {
      id: item.id,
      nama: peg ? peg.nama : 'Unknown',
      nip: peg ? peg.nip : '-',
      tanggal_masuk: item.tanggal_masuk.toISOString(),
      jam_masuk: jamMasukStr,
      jam_keluar: jamKeluarStr,
      foto_masuk: item.foto_masuk,
      foto_keluar: item.foto_keluar,
      total_jam,
      total_terlambat,
      status
    };
  });

  return <RekapClient data={mappedData} initialMulai={filterMulai} initialSampai={filterSampai} />;
}
