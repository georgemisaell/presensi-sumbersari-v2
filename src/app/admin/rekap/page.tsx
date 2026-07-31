import prisma from '@/lib/prisma';
import RekapClient, { RekapData } from './RekapClient';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RekapPage({
  searchParams
}: {
  searchParams: Promise<{ mulai?: string; sampai?: string }>;
}) {
  const resolvedParams = await searchParams;
  const today = new Date();
  
  // Default filter: Tanggal hari ini s.d. hari ini
  const filterMulai = resolvedParams.mulai || format(today, 'yyyy-MM-dd');
  const filterSampai = resolvedParams.sampai || format(today, 'yyyy-MM-dd');

  // Kita gunakan timezone Indonesia/WIB (UTC+7) sebagai standar pencarian jam_masuk.
  // Jika server berjalan di UTC, `new Date("YYYY-MM-DD")` seringkali bermasalah dalam query tanggal lokal.
  const startDate = new Date(filterMulai);
  const endDate = new Date(filterSampai);
  // Tambah 1 hari ke endDate agar mencakup seluruh hari tersebut
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
    select: { id: true, nama: true, nip: true, lokasi_presensi: true }
  });

  const pegawaiMap = new Map(pegawaiList.map(p => [p.id, p]));

  const lokasiList = await prisma.lokasi_presensi.findMany();
  const lokasiMap = new Map(lokasiList.map(l => [l.nama_lokasi, l]));

  const mappedData: RekapData[] = dataRaw.map(item => {
    const peg = pegawaiMap.get(item.id_pegawai);
    const lokasi = peg ? lokasiMap.get(peg.lokasi_presensi) : null;

    const jamMasukStr = item.jam_masuk.toISOString();
    const jamKeluarStr = item.jam_keluar ? item.jam_keluar.toISOString() : null;

    let total_terlambat = 0;
    let status = 'Hadir';

    if (lokasi) {
      let offsetHours = 7;
      if (lokasi.zona_waktu === 'WITA') offsetHours = 8;
      if (lokasi.zona_waktu === 'WIT') offsetHours = 9;

      const actualMins = (item.jam_masuk.getUTCHours() + offsetHours) * 60 + item.jam_masuk.getUTCMinutes();
      const targetMins = lokasi.jam_masuk.getUTCHours() * 60 + lokasi.jam_masuk.getUTCMinutes();
      
      const diffMinutes = actualMins - targetMins;
      if (diffMinutes > 0) {
        total_terlambat = diffMinutes;
        status = 'Terlambat';
      } else {
        status = 'Hadir';
      }

      if (item.jam_keluar) {
        const actualOutMins = (item.jam_keluar.getUTCHours() + offsetHours) * 60 + item.jam_keluar.getUTCMinutes();
        const targetOutMins = lokasi.jam_pulang.getUTCHours() * 60 + lokasi.jam_pulang.getUTCMinutes();
        
        if (actualOutMins < targetOutMins) {
           if (status === 'Terlambat') {
              status = 'Terlambat & Pulang Duluan';
           } else {
              status = 'Pulang Duluan';
           }
        }
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
