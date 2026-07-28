import prisma from '@/lib/prisma';
import JabatanClient from './JabatanClient';

export default async function JabatanPage() {
  const jabatanData = await prisma.jabatan.findMany({
    orderBy: { id: 'desc' }
  });

  return <JabatanClient data={jabatanData} />;
}
