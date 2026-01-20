import { supabase } from '@/lib/supabase';

export async function compressImage(file: File) {
    const imageCompression = (await import('browser-image-compression')).default;
    const options = {
        maxSizeMB: 1, // Max size in MB
        maxWidthOrHeight: 1280, // Max dimension
        useWebWorker: true,
    };
    try {
        return await imageCompression(file, options);
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
}

export async function uploadProductImage(file: File) {
    try {
        // 1. Compress
        const compressedFile = await compressImage(file);

        // 2. Generate path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 3. Upload
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, compressedFile);

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get URL
        const { data } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);


        return data.publicUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

export async function uploadTransferProof(file: File) {
    try {
        let fileToUpload = file;

        // Only compress if it's an image (not PDF)
        if (file.type.startsWith('image/')) {
            fileToUpload = await compressImage(file);
        }

        // 2. Generate path
        const fileExt = file.name.split('.').pop();
        const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `proofs/${fileName}`; // Store in proofs folder within products bucket

        // 3. Upload
        const { error: uploadError } = await supabase.storage
            .from('products') // Reusing products bucket to avoid migration complexity
            .upload(filePath, fileToUpload);

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get URL
        const { data } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error("Error uploading transfer proof:", error);
        throw error;
    }
}
