'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function submitKetidakhadiran(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Pegawai') {
      return { success: false, error: 'Unauthorized' };
    }

    const idPegawai = parseInt(session.user.id);
    const keterangan = data.get('keterangan') as string;
    const deskripsi = data.get('deskripsi') as string;
    const tanggal = data.get('tanggal') as string;

    const foto = data.get('file') as File | null;
    let nama_file = '';
    
    if (foto && foto.size > 0) {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'ketidakhadiran');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const ext = foto.name.split('.').pop() || 'jpg';
      nama_file = `${session.user.nip}_${Date.now()}.${ext}`;
      const path = join(uploadDir, nama_file);
      await writeFile(path, buffer);
    } else {
      return { success: false, error: 'File bukti wajib diunggah' };
    }

    await prisma.ketidakhadiran.create({
      data: {
        id_pegawai: idPegawai,
        keterangan: keterangan,
        tanggal: new Date(tanggal),
        deskripsi: deskripsi,
        file: nama_file,
        status_pengajuan: 'Pending'
      }
    });

    revalidatePath('/pegawai/ketidakhadiran');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
