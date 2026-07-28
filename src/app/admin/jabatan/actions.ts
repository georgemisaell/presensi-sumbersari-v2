'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addJabatan(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const namaJabatan = data.get('jabatan') as string;
    if (!namaJabatan) {
      return { success: false, error: 'Nama jabatan tidak boleh kosong' };
    }

    await prisma.jabatan.create({
      data: {
        jabatan: namaJabatan
      }
    });

    revalidatePath('/admin/jabatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateJabatan(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const id = parseInt(data.get('id') as string);
    const namaJabatan = data.get('jabatan') as string;

    if (!id || !namaJabatan) {
      return { success: false, error: 'Data tidak lengkap' };
    }

    await prisma.jabatan.update({
      where: { id },
      data: { jabatan: namaJabatan }
    });

    revalidatePath('/admin/jabatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteJabatan(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.jabatan.delete({
      where: { id }
    });

    revalidatePath('/admin/jabatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
