import prisma from './src/lib/prisma';

async function main() {
  const filterMulai = "2026-06-29";
  const filterSampai = "2026-07-30";

  const startDate = new Date(filterMulai);
  const endDate = new Date(filterSampai);
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  console.log("Querying from", startDate, "to", endDatePlusOne);

  const dataRaw = await prisma.presensi.findMany({
    where: {
      tanggal_masuk: {
        gte: startDate,
        lt: endDatePlusOne
      }
    },
    orderBy: [
      { tanggal_masuk: 'desc' },
      { jam_masuk: 'desc' }
    ]
  });

  console.log("Raw Data Count:", dataRaw.length);
  console.log("Data:", dataRaw);
}

main().catch(console.error).finally(() => process.exit(0));
