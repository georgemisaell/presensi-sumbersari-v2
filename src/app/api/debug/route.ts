import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const startDate = new Date("2026-07-29");
  const endDatePlusOne = new Date("2026-07-30");

  const data = await prisma.presensi.findMany({
    where: {
      tanggal_masuk: {
        gte: startDate,
        lt: endDatePlusOne
      }
    },
    orderBy: { id: 'desc' },
    take: 10
  });
  return NextResponse.json(data);
}
