import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black text-center">
        <h1 className="text-3xl font-bold mb-4">Sistem Presensi</h1>
        <p className="text-lg text-slate-500">Desa Sumbersari, Kabupaten Madiun</p>
      </main>
    </div>
  );
}
