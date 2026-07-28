'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function updatePassword(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const password_baru = data.get('password_baru') as string;
    const ulangi_password_baru = data.get('ulangi_password_baru') as string;

    if (!password_baru || !ulangi_password_baru) {
      return { success: false, error: 'Semua field wajib diisi!' };
    }

    if (password_baru !== ulangi_password_baru) {
      return { success: false, error: 'Password baru dan ulangi password tidak cocok!' };
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);

    await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: {
        password: hashedPassword
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
