import { createClient } from '@supabase/supabase-js';
import { logger } from '../logger';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

/**
 * Upload file to Supabase Storage
 */
export async function uploadToSupabase(
    fileBuffer: Buffer,
    filename: string,
    bucket: string = 'campaign-images'
): Promise<string> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${filename}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(uniqueFilename, fileBuffer, {
                contentType: getContentType(filename),
                upsert: false,
            });

        if (error) {
            logger.error('Supabase upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        logger.info(`File uploaded to Supabase: ${urlData.publicUrl}`);
        return urlData.publicUrl;
    } catch (error) {
        logger.error('Upload error:', error);
        throw error;
    }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadMultipleToSupabase(
    files: { buffer: Buffer; filename: string }[],
    bucket: string = 'documents'
): Promise<string[]> {
    const uploadPromises = files.map(({ buffer, filename }) =>
        uploadToSupabase(buffer, filename, bucket)
    );

    return Promise.all(uploadPromises);
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(
    filePath: string,
    bucket: string = 'campaign-images'
): Promise<void> {
    try {
        // Extract filename from URL
        const filename = filePath.split('/').pop();
        if (!filename) {
            throw new Error('Invalid file path');
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filename]);

        if (error) {
            logger.error('Supabase delete error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }

        logger.info(`File deleted from Supabase: ${filename}`);
    } catch (error) {
        logger.error('Delete error:', error);
        throw error;
    }
}

/**
 * Get content type from filename
 */
function getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        pdf: 'application/pdf',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Create storage buckets if they don't exist
 */
export async function ensureBucketsExist() {
    const buckets = ['campaign-images', 'documents', 'hospital-verification'];

    for (const bucket of buckets) {
        try {
            const { data, error } = await supabase.storage.getBucket(bucket);

            if (error && error.message.includes('not found')) {
                // Create bucket
                await supabase.storage.createBucket(bucket, {
                    public: true,
                    fileSizeLimit: 10485760, // 10MB
                });
                logger.info(`Created storage bucket: ${bucket}`);
            }
        } catch (error) {
            logger.warn(`Bucket check/create error for ${bucket}:`, error);
        }
    }
}
