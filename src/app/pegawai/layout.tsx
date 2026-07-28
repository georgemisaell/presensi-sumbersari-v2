import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, MapPin } from 'lucide-react';

export default async function PegawaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'Pegawai') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img src="/logo-kabupaten-madiun.webp" alt="Logo Kabupaten Madiun" className="w-10 h-10 object-contain drop-shadow-sm" />
                <Link href="/pegawai/home" className="text-xl font-bold text-slate-800 tracking-tight hover:text-emerald-600 transition-colors">Presensi</Link>
              </div>
              
              <nav className="hidden md:flex items-center gap-4 border-l border-slate-200 pl-6">
                <Link href="/pegawai/home" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Home</Link>
                <Link href="/pegawai/ketidakhadiran" className="text-sm font-semibold text-slate-600 hover:text-emerald-600">Izin & Cuti</Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/pegawai/profile" className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors group" title="Lihat Profil">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{session.user.nama}</span>
                  <span className="text-xs text-slate-500">{session.user.jabatan}</span>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-emerald-500 flex items-center justify-center">
                  {session.user.foto && session.user.foto !== 'default.jpg' ? (
                    <img src={`/uploads/pegawai/${session.user.foto}`} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </Link>

              <Link 
                href="/logout" 
                className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Presensi Sumbersari V2. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
