import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Masukkan username dan password.');
        }

        const user = await prisma.users.findFirst({
          where: { username: credentials.username },
          include: { pegawai: true },
        });

        if (!user) {
          throw new Error('Username salah, silahkan coba lagi!');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Password salah, silahkan coba lagi!');
        }

        if (user.status !== 'Aktif') {
          throw new Error('Akun anda belum aktif!');
        }

        return {
          id: user.id.toString(),
          role: user.role,
          username: user.username,
          nama: user.pegawai.nama,
          nip: user.pegawai.nip,
          jabatan: user.pegawai.jabatan,
          lokasi_presensi: user.pegawai.lokasi_presensi,
          foto: user.pegawai.foto,
          jenis_kelamin: user.pegawai.jenis_kelamin,
          alamat: user.pegawai.alamat,
          no_handphone: user.pegawai.no_handphone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.nama = user.nama;
        token.nip = user.nip;
        token.jabatan = user.jabatan;
        token.lokasi_presensi = user.lokasi_presensi;
        token.foto = user.foto;
        token.jenis_kelamin = user.jenis_kelamin;
        token.alamat = user.alamat;
        token.no_handphone = user.no_handphone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.nama = token.nama;
        session.user.nip = token.nip;
        session.user.jabatan = token.jabatan;
        session.user.lokasi_presensi = token.lokasi_presensi;
        session.user.foto = token.foto;
        session.user.jenis_kelamin = token.jenis_kelamin;
        session.user.alamat = token.alamat;
        session.user.no_handphone = token.no_handphone;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret_presensi_sumbersari',
};
