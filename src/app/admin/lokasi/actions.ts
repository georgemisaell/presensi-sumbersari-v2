'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addLokasi(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const jamMasuk = data.get('jam_masuk') as string;
    const jamPulang = data.get('jam_pulang') as string;
    
    // Convert HH:mm to a dummy date with that time (Prisma uses 1970-01-01 for time fields typically)
    const jamMasukDate = new Date(`1970-01-01T${jamMasuk}:00Z`);
    const jamPulangDate = new Date(`1970-01-01T${jamPulang}:00Z`);

    await prisma.lokasi_presensi.create({
      data: {
        nama_lokasi: data.get('nama_lokasi') as string,
        alamat_lokasi: data.get('alamat_lokasi') as string,
        tipe_lokasi: data.get('tipe_lokasi') as string,
        latitude: data.get('latitude') as string,
        longitude: data.get('longitude') as string,
        radius: parseInt(data.get('radius') as string),
        zona_waktu: data.get('zona_waktu') as string,
        jam_masuk: jamMasukDate,
        jam_pulang: jamPulangDate,
      }
    });

    revalidatePath('/admin/lokasi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLokasi(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const id = parseInt(data.get('id') as string);
    const jamMasuk = data.get('jam_masuk') as string;
    const jamPulang = data.get('jam_pulang') as string;
    
    const jamMasukDate = new Date(`1970-01-01T${jamMasuk}:00Z`);
    const jamPulangDate = new Date(`1970-01-01T${jamPulang}:00Z`);

    await prisma.lokasi_presensi.update({
      where: { id },
      data: {
        nama_lokasi: data.get('nama_lokasi') as string,
        alamat_lokasi: data.get('alamat_lokasi') as string,
        tipe_lokasi: data.get('tipe_lokasi') as string,
        latitude: data.get('latitude') as string,
        longitude: data.get('longitude') as string,
        radius: parseInt(data.get('radius') as string),
        zona_waktu: data.get('zona_waktu') as string,
        jam_masuk: jamMasukDate,
        jam_pulang: jamPulangDate,
      }
    });

    revalidatePath('/admin/lokasi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLokasi(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.lokasi_presensi.delete({
      where: { id }
    });

    revalidatePath('/admin/lokasi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
