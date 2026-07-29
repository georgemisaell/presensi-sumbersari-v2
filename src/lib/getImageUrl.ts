export function getImageUrl(folder: string, fileName: string) {
  if (!fileName) return '/images/default.jpg'; // fallback
  if (fileName.startsWith('http')) return fileName; // already full URL
  if (fileName === 'default.jpg') return '/images/default.jpg'; // local fallback
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/uploads/${folder}/${fileName}`;
}
