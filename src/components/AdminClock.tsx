'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date()); // initialize on client to avoid hydration mismatch
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="flex flex-col items-center justify-center animate-pulse">
        <div className="h-16 w-64 bg-slate-200 rounded-xl mb-2"></div>
        <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-5xl md:text-7xl font-black text-blue-600 tracking-tighter tabular-nums mb-2" style={{ textShadow: '0 4px 20px rgba(37, 99, 235, 0.2)' }}>
        {format(time, 'HH:mm:ss')}
      </h2>
      <p className="text-lg md:text-xl text-slate-500 font-medium">
        {format(time, 'EEEE, dd MMMM yyyy', { locale: id })}
      </p>
    </div>
  );
}
