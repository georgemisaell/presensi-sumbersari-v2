'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, XCircle, MapPin, Camera as CameraIcon } from 'lucide-react';
import { PresensiMap } from '@/components/PresensiMapDynamic';
import PresensiCamera from '@/components/PresensiCamera';
import { submitPresensiMasuk, submitPresensiKeluar } from '../actions';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  lokasi: {
    lat: number;
    lng: number;
    radius: number;
    nama: string;
    jam_pulang: string;
  };
  presensi: {
    id: number;
    waktu_masuk: string;
    waktu_keluar: string | null;
  } | null;
}

export default function DashboardClient({ lokasi, presensi }: DashboardClientProps) {
  const router = useRouter();
  const [time, setTime] = useState<Date>(new Date());
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'masuk' | 'keluar'>('masuk');
  const [step, setStep] = useState<1 | 2>(1); // 1 = Map, 2 = Camera
  
  // Check-in States
  const [locationValid, setLocationValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openPresensi = (type: 'masuk' | 'keluar') => {
    setMode(type);
    setStep(1);
    setLocationValid(false);
    setErrorSubmit('');
    setIsModalOpen(true);
  };

  const handleLocationValidated = (valid: boolean, lat: number, lng: number) => {
    setLocationValid(valid);
  };

  const handleCapture = async (base64Image: string) => {
    if (!base64Image) return; // user clicked retake
    
    setIsSubmitting(true);
    setErrorSubmit('');
    
    try {
      if (mode === 'masuk') {
        const res = await submitPresensiMasuk(base64Image);
        if (res.success) {
          setIsModalOpen(false);
          router.refresh();
        } else {
          setErrorSubmit(res.error || 'Gagal presensi masuk');
        }
      } else {
        if (!presensi) return;
        const res = await submitPresensiKeluar(base64Image, presensi.id);
        if (res.success) {
          setIsModalOpen(false);
          router.refresh();
        } else {
          setErrorSubmit(res.error || 'Gagal presensi keluar');
        }
      }
    } catch (e: any) {
      setErrorSubmit(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSudahWaktuPulang = () => {
    if (!lokasi.jam_pulang) return true;
    const parts = lokasi.jam_pulang.split(':');
    const pulangH = parseInt(parts[0], 10);
    const pulangM = parseInt(parts[1], 10);
    
    const currentH = time.getHours();
    const currentM = time.getMinutes();
    
    return currentH > pulangH || (currentH === pulangH && currentM >= pulangM);
  };


  return (
    <div className="flex flex-col gap-8">
      {/* Clock Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50"></div>
        
        <h1 className="text-6xl md:text-8xl font-black text-slate-800 tracking-tighter tabular-nums z-10" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
          {format(time, 'HH:mm:ss')}
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium mt-2 z-10">
          {format(time, 'EEEE, dd MMMM yyyy', { locale: id })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presensi Masuk Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Presensi Masuk</h2>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {!presensi ? (
              <div className="w-full text-center">
                <p className="text-slate-500 mb-6">Anda belum melakukan presensi masuk hari ini.</p>
                <button 
                  onClick={() => openPresensi('masuk')}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
                >
                  Mulai Presensi Masuk
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Berhasil Masuk</h3>
                <p className="text-slate-500 mt-1">Pada {format(new Date(presensi.waktu_masuk), 'HH:mm')} WIB</p>
              </div>
            )}
          </div>
        </div>

        {/* Presensi Keluar Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Presensi Keluar</h2>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {!presensi ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400">Silakan presensi masuk terlebih dahulu.</p>
              </div>
            ) : presensi.waktu_keluar ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Berhasil Keluar</h3>
                <p className="text-slate-500 mt-1">Pada {format(new Date(presensi.waktu_keluar), 'HH:mm')} WIB</p>
              </div>
            ) : !isSudahWaktuPulang() ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-500">⏳</span>
                </div>
                <p className="text-amber-600 font-medium">Belum waktunya pulang</p>
                <p className="text-slate-500 text-sm mt-1">Jam pulang: {lokasi.jam_pulang} WIB</p>
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-slate-500 mb-6">Waktunya pulang! Silakan absen keluar.</p>
                <button 
                  onClick={() => openPresensi('keluar')}
                  className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-rose-500/20 transition-transform active:scale-95"
                >
                  Mulai Presensi Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Presensi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 capitalize">
                Presensi {mode}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {errorSubmit && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                  {errorSubmit}
                </div>
              )}

              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8 gap-4">
                <div className={`flex flex-col items-center ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500 ring-offset-2' : 'bg-slate-100'}`}>1</div>
                  <span className="text-xs font-semibold">Validasi Lokasi</span>
                </div>
                <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                <div className={`flex flex-col items-center ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500 ring-offset-2' : 'bg-slate-100'}`}>2</div>
                  <span className="text-xs font-semibold">Ambil Foto</span>
                </div>
              </div>

              {step === 1 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <PresensiMap 
                    kantorLat={lokasi.lat} 
                    kantorLng={lokasi.lng} 
                    radius={lokasi.radius} 
                    onLocationValid={handleLocationValidated} 
                  />
                  <button
                    disabled={!locationValid}
                    onClick={() => setStep(2)}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-semibold py-4 rounded-xl mt-2 transition-colors disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    Lanjut ke Foto <CameraIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-700 text-sm font-medium flex gap-2">
                    <CameraIcon className="w-5 h-5 shrink-0" />
                    Silakan ambil foto wajah Anda yang terlihat jelas.
                  </div>
                  
                  <PresensiCamera onCapture={handleCapture} />

                  {isSubmitting && (
                    <div className="text-center text-sm font-medium text-emerald-600 animate-pulse mt-4">
                      Menyimpan data presensi...
                    </div>
                  )}

                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl transition-colors mt-2"
                    disabled={isSubmitting}
                  >
                    Kembali ke Peta
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
