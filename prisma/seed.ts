import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

let dbUrl = (process.env.DATABASE_URL || '').replace('mysql://', 'mariadb://');
if (dbUrl.includes(':@')) {
  dbUrl = dbUrl.replace(':@', '@');
}
const adapter = new PrismaMariaDb(dbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = bcrypt.hashSync('admin123', 10);

  // --- Seed Admin ---
  const adminPegawai = await prisma.pegawai.create({
    data: {
      nip: '000000001',
      nama: 'Administrator',
      jenis_kelamin: 'Laki-laki',
      alamat: 'Kantor Pusat',
      no_handphone: '081234567890',
      jabatan: 'Admin Sistem',
      lokasi_presensi: 'Kantor Pusat',
      foto: 'default.jpg',
    },
  });

  await prisma.users.create({
    data: {
      id_pegawai: adminPegawai.id,
      username: 'admin',
      password: passwordHash,
      status: 'aktif',
      role: 'admin',
    },
  });
  console.log('Admin account created: username: admin, password: admin123');

  // --- Seed Pegawai ---
  const pegawai = await prisma.pegawai.create({
    data: {
      nip: '111111111',
      nama: 'Pegawai Contoh',
      jenis_kelamin: 'Laki-laki',
      alamat: 'Alamat Pegawai',
      no_handphone: '081234567891',
      jabatan: 'Staf',
      lokasi_presensi: 'Kantor Pusat',
      foto: 'default.jpg',
    },
  });

  await prisma.users.create({
    data: {
      id_pegawai: pegawai.id,
      username: 'pegawai',
      password: passwordHash,
      status: 'aktif',
      role: 'pegawai',
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
