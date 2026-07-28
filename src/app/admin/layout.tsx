import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'Admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar user={session.user} />

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-64 min-h-screen flex flex-col">
        <div className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
