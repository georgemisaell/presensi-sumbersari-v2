import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  
  // MariaDB adapter requires the connection string to start with mariadb:// instead of mysql://
  const mariadbConnectionString = connectionString.replace('mysql://', 'mariadb://');
  
  // Pass the connection string directly to the adapter
  const adapter = new PrismaMariaDb(mariadbConnectionString);
  
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
