'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

export async function submitPresensiMasuk(base64Image: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Pegawai') {
      return { success: false, error: 'Unauthorized' };
    }

    const idPegawai = parseInt(session.user.id);
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    
    // Check if already checked in today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const existing = await prisma.presensi.findFirst({
      where: {
        id_pegawai: idPegawai,
        OR: [
          {
            tanggal_masuk: {
              gte: startOfDay,
              lt: endOfDay
            }
          },
          {
            tanggal_masuk: todayUTC
          }
        ]
      }
    });

    if (existing) {
      return { success: false, error: 'Anda sudah melakukan presensi masuk hari ini.' };
    }

    // Process image
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'presensi');
    
    // Create directory if not exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // ignore exists error
    }

    const fileName = `masuk_${idPegawai}_${today.getTime()}.jpg`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Save to database
    await prisma.presensi.create({
      data: {
        id_pegawai: idPegawai,
        tanggal_masuk: todayUTC,
        jam_masuk: today,
        foto_masuk: fileName
      }
    });

    revalidatePath('/pegawai/home');
    return { success: true };
  } catch (error: any) {
    console.error('Error in submitPresensiMasuk:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan sistem.' };
  }
}

export async function submitPresensiKeluar(base64Image: string, idPresensi: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Pegawai') {
      return { success: false, error: 'Unauthorized' };
    }

    const idPegawai = parseInt(session.user.id);
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    
    // Process image
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'presensi');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // ignore
    }

    const fileName = `keluar_${idPegawai}_${today.getTime()}.jpg`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Update database
    await prisma.presensi.update({
      where: {
        id: idPresensi
      },
      data: {
        tanggal_keluar: todayUTC,
        jam_keluar: today,
        foto_keluar: fileName
      }
    });

    revalidatePath('/pegawai/home');
    return { success: true };
  } catch (error: any) {
    console.error('Error in submitPresensiKeluar:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan sistem.' };
  }
}

