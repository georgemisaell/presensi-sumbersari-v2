'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';

interface PresensiCameraProps {
  onCapture: (imageSrc: string) => void;
}

export default function PresensiCamera({ onCapture }: PresensiCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImgSrc(null);
    onCapture('');
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div className="relative w-full max-w-sm aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner border-4 border-slate-100">
        {!imgSrc ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            mirrored={false}
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
        )}
      </div>
      
      {!imgSrc ? (
        <button
          onClick={capture}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all font-semibold active:scale-95"
        >
          <Camera className="w-5 h-5" />
          Ambil Foto
        </button>
      ) : (
        <button
          onClick={retake}
          className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-full transition-all font-semibold active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          Ulangi Foto
        </button>
      )}
    </div>
  );
}
