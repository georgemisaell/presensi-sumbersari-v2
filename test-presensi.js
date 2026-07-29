const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  console.log("Local today:", today);
  console.log("Start of Day:", startOfDay);
  console.log("End of Day:", endOfDay);

  const presensiHadir = await prisma.presensi.findMany({
    where: {
      tanggal_masuk: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });

  console.log("Presensi count with Date filter:", presensiHadir.length);
  const allPresensi = await prisma.presensi.findMany();
  console.log("All Presensi length:", allPresensi.length);
  if (allPresensi.length > 0) {
    console.log("Latest Presensi tanggal_masuk:", allPresensi[allPresensi.length - 1].tanggal_masuk);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
