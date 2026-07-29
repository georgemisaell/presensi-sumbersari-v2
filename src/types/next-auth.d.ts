import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
      nama: string;
      nip: string;
      jabatan: string;
      lokasi_presensi: string;
      foto: string;
      jenis_kelamin: string;
      alamat: string;
      no_handphone: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    username: string;
    nama: string;
    nip: string;
    jabatan: string;
    lokasi_presensi: string;
    foto: string;
    jenis_kelamin: string;
    alamat: string;
    no_handphone: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    username: string;
    nama: string;
    nip: string;
    jabatan: string;
    lokasi_presensi: string;
    foto: string;
    jenis_kelamin: string;
    alamat: string;
    no_handphone: string;
  }
}
