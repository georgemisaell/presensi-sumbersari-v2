'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateStatusKetidakhadiran(id: number, status: 'Approved' | 'Rejected') {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.ketidakhadiran.update({
      where: { id },
      data: {
        status_pengajuan: status
      }
    });

    revalidatePath('/admin/ketidakhadiran');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
