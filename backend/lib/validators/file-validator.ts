const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
];

const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    ...ALLOWED_IMAGE_TYPES,
];

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
        };
    }

    return { valid: true };
}

export function validateDocumentFile(file: File): FileValidationResult {
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only PDF and image files are allowed'
        };
    }

    return { valid: true };
}

export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

export function sanitizeFilename(filename: string): string {
    // Remove special characters and spaces
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}
