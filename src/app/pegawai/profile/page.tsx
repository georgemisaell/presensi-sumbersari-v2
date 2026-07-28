import React from 'react';
import ProfileClient from '@/components/ProfileClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Profil Saya | Presensi Sumbersari',
};

export default async function PegawaiProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  return <ProfileClient user={session.user} />;
}
