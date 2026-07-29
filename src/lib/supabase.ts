import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadToSupabase(fileBuffer: Buffer, fileName: string, folder: string = 'presensi'): Promise<string> {
  const filePath = `${folder}/${fileName}`;
  
  const { data, error } = await supabase
    .storage
    .from('uploads')
    .upload(filePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Gagal mengunggah file ke Supabase: ${error.message}`);
  }

  // Dapatkan Public URL
  const { data: publicUrlData } = supabase
    .storage
    .from('uploads')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
