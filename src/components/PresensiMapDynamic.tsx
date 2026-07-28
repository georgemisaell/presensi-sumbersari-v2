import dynamic from 'next/dynamic';

export const PresensiMap = dynamic(
  () => import('./PresensiMap'),
  { ssr: false }
);
