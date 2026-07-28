import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      nama: string;
      nip: string;
      jabatan: string;
      lokasi_presensi: string;
      foto: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    nama: string;
    nip: string;
    jabatan: string;
    lokasi_presensi: string;
    foto: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    nama: string;
    nip: string;
    jabatan: string;
    lokasi_presensi: string;
    foto: string;
  }
}
