import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const presensi = await prisma.presensi.findMany();
  const users = await prisma.users.findMany();
  const pegawai = await prisma.pegawai.findMany();
  
  return NextResponse.json({ presensi, users, pegawai });
}
