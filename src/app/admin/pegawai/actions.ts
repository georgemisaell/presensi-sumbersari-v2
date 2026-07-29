'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { uploadToSupabase } from '@/lib/supabase';

export async function addPegawai(data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const password = data.get('password') as string;
    const ulangi_password = data.get('ulangi_password') as string;

    if (password !== ulangi_password) {
      return { success: false, error: 'Password tidak sama!' };
    }

    // Auto generate NIP PEG-XXXX
    const lastPegawai = await prisma.pegawai.findFirst({
      orderBy: { id: 'desc' }
    });
    
    let nipBaru = "PEG-0001";
    if (lastPegawai && lastPegawai.nip.startsWith('PEG-')) {
      const nipDb = lastPegawai.nip.split('-');
      if (nipDb.length === 2) {
        const noBaru = parseInt(nipDb[1]) + 1;
        nipBaru = 'PEG-' + noBaru.toString().padStart(4, '0');
      }
    }

    // Handle Photo Upload
    const foto = data.get('foto') as File | null;
    let nama_file = 'default.jpg';
    
    if (foto && foto.size > 0) {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const ext = foto.name.split('.').pop() || 'jpg';
      nama_file = `${nipBaru}_${Date.now()}.${ext}`;
      const publicUrl = await uploadToSupabase(buffer, nama_file, 'pegawai');
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Pegawai & User in Transaction
    await prisma.$transaction(async (tx) => {
      const pegawaiBaru = await tx.pegawai.create({
        data: {
          nip: nipBaru,
          nama: data.get('nama') as string,
          jenis_kelamin: data.get('jenis_kelamin') as string,
          alamat: data.get('alamat') as string,
          no_handphone: data.get('no_handphone') as string,
          jabatan: data.get('jabatan') as string,
          lokasi_presensi: data.get('lokasi_presensi') as string,
          foto: nama_file
        }
      });

      await tx.users.create({
        data: {
          id_pegawai: pegawaiBaru.id,
          username: data.get('username') as string,
          password: hashedPassword,
          status: data.get('status') as string,
          role: data.get('role') as string
        }
      });
    });

    revalidatePath('/admin/pegawai');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePegawai(id: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Prisma Cascade delete usually handles Users deletion if configured, 
    // but schema says `onDelete: Cascade` for Users -> Pegawai. So deleting pegawai deletes users.
    await prisma.pegawai.delete({
      where: { id }
    });

    revalidatePath('/admin/pegawai');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePegawai(id: number, data: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const password = data.get('password') as string;
    const ulangi_password = data.get('ulangi_password') as string;

    if (password && password !== ulangi_password) {
      return { success: false, error: 'Password tidak sama!' };
    }

    const pegawaiLama = await prisma.pegawai.findUnique({ where: { id } });
    if (!pegawaiLama) throw new Error('Pegawai tidak ditemukan');

    const foto = data.get('foto') as File | null;
    let nama_file = pegawaiLama.foto;
    
    if (foto && foto.size > 0) {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const ext = foto.name.split('.').pop() || 'jpg';
      nama_file = `${pegawaiLama.nip}_${Date.now()}.${ext}`;
      const publicUrl = await uploadToSupabase(buffer, nama_file, 'pegawai');
    }

    await prisma.$transaction(async (tx) => {
      await tx.pegawai.update({
        where: { id },
        data: {
          nama: data.get('nama') as string,
          jenis_kelamin: data.get('jenis_kelamin') as string,
          alamat: data.get('alamat') as string,
          no_handphone: data.get('no_handphone') as string,
          jabatan: data.get('jabatan') as string,
          lokasi_presensi: data.get('lokasi_presensi') as string,
          foto: nama_file
        }
      });

      const updateDataUser: any = {
        username: data.get('username') as string,
        status: data.get('status') as string,
        role: data.get('role') as string
      };

      if (password) {
        updateDataUser.password = await bcrypt.hash(password, 10);
      }

      await tx.users.updateMany({
        where: { id_pegawai: id },
        data: updateDataUser
      });
    });

    revalidatePath('/admin/pegawai');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

