const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  const data = await prisma.presensi.findMany({ take: 5, orderBy: { id: 'desc' } });
  console.log(data);
}
main().finally(() => prisma.$disconnect());
