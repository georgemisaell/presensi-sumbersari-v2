'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, MapPin, Users, FileText, Briefcase, Menu, X, Map, LayoutDashboard, ChevronDown, Database } from 'lucide-react';

interface AdminSidebarProps {
  user: any;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Auto open Data Master if we are in one of its subpages
  const [isDataMasterOpen, setIsDataMasterOpen] = useState(
    pathname.startsWith('/admin/jabatan') || pathname.startsWith('/admin/lokasi')
  );

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/admin/home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Pegawai', href: '/admin/pegawai', icon: <Users className="w-5 h-5" /> },
    { 
      name: 'Data Master', 
      icon: <Database className="w-5 h-5" />,
      subItems: [
        { name: 'Jabatan', href: '/admin/jabatan', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Lokasi Presensi', href: '/admin/lokasi', icon: <Map className="w-4 h-4" /> },
      ]
    },
    { name: 'Ketidakhadiran', href: '/admin/ketidakhadiran', icon: <FileText className="w-5 h-5" /> },
    { name: 'Rekap Absen', href: '/admin/rekap', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <span className="font-bold text-slate-800 flex items-center gap-2">
          <img src="/logo-kabupaten-madiun.webp" alt="Logo Kabupaten Madiun" className="w-6 h-6 object-contain" />
          Admin Panel
        </span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-screen
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-kabupaten-madiun.webp" alt="Logo Kabupaten Madiun" className="w-10 h-10 object-contain drop-shadow-md" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">Presensi Sumbersari</p>
            </div>
          </div>
          <button className="md:hidden p-1 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Menu Utama</div>
          {navItems.map((item) => {
            if (item.subItems) {
              const isChildActive = pathname.startsWith('/admin/jabatan') || pathname.startsWith('/admin/lokasi');
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <button 
                    onClick={() => setIsDataMasterOpen(!isDataMasterOpen)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors w-full text-left ${isChildActive && !isDataMasterOpen ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDataMasterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDataMasterOpen && (
                    <div className="flex flex-col gap-1 ml-4 border-l border-slate-700 pl-2 mt-1">
                      {item.subItems.map(subItem => {
                        const isActive = pathname.startsWith(subItem.href);
                        return (
                          <Link 
                            key={subItem.name} 
                            href={subItem.href} 
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                          >
                            {subItem.icon}
                            <span className="font-medium">{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname.startsWith(item.href!);
            return (
              <Link 
                key={item.name} 
                href={item.href!} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors group">
            <Link href="/admin/profile" className="flex flex-col flex-1" title="Lihat Profil">
              <span className="text-sm font-semibold group-hover:text-blue-400 transition-colors">{user.nama || 'Administrator'}</span>
              <span className="text-xs text-slate-400">@{user.nip}</span>
            </Link>
            <Link 
              href="/logout" 
              className="p-2 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors ml-2"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
