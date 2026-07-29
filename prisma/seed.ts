import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = bcrypt.hashSync('admin123', 10);

  // --- Seed Admin ---
  const adminPegawai = await prisma.pegawai.create({
    data: {
      nip: 'PEG-0001',
      nama: 'Administrator',
      jenis_kelamin: 'Laki-laki',
      alamat: 'Kantor Pusat',
      no_handphone: '081234567890',
      jabatan: 'Karyawan Desa',
      lokasi_presensi: 'Kantor Pusat',
      foto: 'default.jpg',
    },
  });

  await prisma.users.create({
    data: {
      id_pegawai: adminPegawai.id,
      username: 'admin',
      password: passwordHash,
      status: 'Aktif',
      role: 'Admin',
    },
  });
  console.log('Admin account created: username: admin, password: admin123');

  // --- Seed Pegawai ---
  const pegawai = await prisma.pegawai.create({
    data: {
      nip: 'PEG-0002',
      nama: 'Pegawai',
      jenis_kelamin: 'Laki-laki',
      alamat: 'Desa Sumbersari',
      no_handphone: '081234567891',
      jabatan: 'Karyawan Desa',
      lokasi_presensi: 'Kantor Pusat',
      foto: 'default.jpg',
    },
  });

  await prisma.users.create({
    data: {
      id_pegawai: pegawai.id,
      username: 'pegawai',
      password: passwordHash,
      status: 'Aktif',
      role: 'Pegawai',
    },
  });
  console.log('Pegawai account created: username: pegawai, password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
