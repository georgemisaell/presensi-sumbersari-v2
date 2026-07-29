import { PrismaClient } from '../src/generated/prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const presensi = await prisma.presensi.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  });
  
  const lokasi = await prisma.lokasi_presensi.findFirst();

  console.log("=== PRESENSI ===");
  for (const p of presensi) {
    console.log(`ID: ${p.id} | jam_masuk: ${p.jam_masuk.toISOString()} | getUTCHours: ${p.jam_masuk.getUTCHours()} | getUTCMinutes: ${p.jam_masuk.getUTCMinutes()}`);
  }

  console.log("\n=== LOKASI ===");
  if (lokasi) {
    console.log(`jam_masuk: ${lokasi.jam_masuk.toISOString()} | getUTCHours: ${lokasi.jam_masuk.getUTCHours()} | getUTCMinutes: ${lokasi.jam_masuk.getUTCMinutes()}`);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
