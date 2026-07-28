import prisma from '@/lib/prisma';
import LokasiClient, { LokasiData } from './LokasiClient';
import { format } from 'date-fns';

export default async function LokasiPage() {
  const lokasiDataRaw = await prisma.lokasi_presensi.findMany({
    orderBy: { id: 'desc' }
  });

  // Convert Date objects to HH:mm string for client component
  const lokasiData: LokasiData[] = lokasiDataRaw.map(item => ({
    ...item,
    jam_masuk: item.jam_masuk.toISOString().substring(11, 16),
    jam_pulang: item.jam_pulang.toISOString().substring(11, 16)
  }));

  return <LokasiClient data={lokasiData} />;
}
