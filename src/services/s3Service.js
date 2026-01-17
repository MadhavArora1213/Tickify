import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

const bucketName = import.meta.env.VITE_AWS_BUCKET_NAME;
const region = import.meta.env.VITE_AWS_REGION;
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

// Debug: Log config (masked)
console.log('🪣 S3 Config:', {
    bucket: bucketName || '❌ MISSING',
    region: region || '❌ MISSING',
    accessKeyId: accessKeyId ? '✅ SET' : '❌ MISSING',
    secretAccessKey: secretAccessKey ? '✅ SET' : '❌ MISSING',
});

// Validate config
if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
    console.error('❌ AWS S3 Configuration is incomplete! Check your .env file.');
}

// Initialize S3 Client
// WARNING: Storing keys in frontend code is not recommended for production.
// Ensure your S3 bucket has restricted CORS and Permissions.
const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

/**
 * Helper to crop/resize image to strict dimensions (Center Crop)
 * Implements "Smart Resizing":
 * 1. Enforce 16:9 Aspect Ratio (Safe for both Events Card and Details Hero).
 * 2. Prevent Upscaling: If source is smaller than target 1920x1080, keep native resolution to avoid blur.
 * 3. High Quality: Use high image smoothing.
 */
const cropAndResize = (file, targetMaxLength = 1920) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Target Aspect Ratio: 16:9
                const targetAspect = 16 / 9;
                const sourceAspect = img.width / img.height;

                let sx, sy, sWidth, sHeight;

                // 1. Calculate the Crop Rectangle (Source)
                // We want to grab the largest possible area from source that matches targetAspect (Center Crop)
                if (sourceAspect > targetAspect) {
                    // Source is wider than target: fit by height, trim width
                    sHeight = img.height;
                    sWidth = img.height * targetAspect;
                    sy = 0;
                    sx = (img.width - sWidth) / 2;
                } else {
                    // Source is taller than target: fit by width, trim height
                    sWidth = img.width;
                    sHeight = img.width / targetAspect;
                    sx = 0;
                    sy = (img.height - sHeight) / 2;
                }

                // 2. Determine Output Dimensions (Destination)
                // "Smart": Don't force 1920px if the image is smaller (avoids pixelation).
                // But cap it at targetMaxLength (e.g. 1920) to ensure optimization.

                let renderWidth, renderHeight;

                if (sWidth < targetMaxLength) {
                    // Source crop is smaller than target? Keep native res.
                    renderWidth = sWidth;
                    renderHeight = sHeight;
                } else {
                    // Source crop is huge? Downscale to target.
                    renderWidth = targetMaxLength;
                    renderHeight = targetMaxLength / targetAspect;
                }

                canvas.width = renderWidth;
                canvas.height = renderHeight;

                const ctx = canvas.getContext('2d');
                // Use better quality settings
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw crop
                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, renderWidth, renderHeight);

                console.log(`🖼️ Smart Resize: ${img.width}x${img.height} -> Crop ${Math.round(sWidth)}x${Math.round(sHeight)} -> Output ${Math.round(renderWidth)}x${Math.round(renderHeight)}`);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Canvas to Blob failed"));
                        return;
                    }
                    // Create new File from blob
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(newFile);
                }, 'image/jpeg', 0.92); // 92% quality JPEG
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/**
 * Compresses an image file to be under a certain size (default 1MB).
 */
export const compressImage = async (file) => {
    const options = {
        maxSizeMB: 1, // Max size in MB
        maxWidthOrHeight: 1920, // Resize if too huge
        useWebWorker: true
    };
    try {
        console.log(`📸 Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`📸 Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        toast.error("Error compressing image");
        throw error;
    }
};

/**
 * Uploads a file to S3 after compression.
 * @param {File} file - The file object to upload
 * @param {string} folder - The folder path in S3 bucket (default 'uploads')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToS3 = async (file, folder = 'uploads') => {
    if (!file) return null;

    // Check config before attempting upload
    if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
        throw new Error('AWS S3 is not configured. Please check your .env file has VITE_AWS_BUCKET_NAME, VITE_AWS_REGION, VITE_AWS_ACCESS_KEY_ID, and VITE_AWS_SECRET_ACCESS_KEY.');
    }

    try {
        console.log('🚀 Starting S3 upload for:', folder);

        let fileToProcess = file;

        // 0. Crop/Resize if it's a Banner
        // Enforce 16:9 for banners with Smart Resizing
        if (folder.includes('banners')) {
            console.log('🖼️ Processing banner: smart crop & resize...');
            try {
                fileToProcess = await cropAndResize(file, 1920);
            } catch (cropError) {
                console.error('⚠️ Smart resizing failed, proceeding with original:', cropError);
            }
        }

        // 1. Compress (This will also help file size after crop)
        const compressedFile = await compressImage(fileToProcess);

        // 2. Convert to ArrayBuffer then Uint8Array (fixes AWS SDK v3 browser issue)
        const arrayBuffer = await compressedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // 3. Prepare Upload
        const fileExtension = compressedFile.name.split('.').pop() || 'jpg';
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        console.log(`📤 Uploading to: ${fileName}`);

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: uint8Array,
            ContentType: compressedFile.type || 'image/jpeg',
            // ACL: 'public-read' // REMOVED: Bucket does not support ACLs. Use Bucket Policy instead.
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Return the object URL
        const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        console.log('✅ Upload successful! URL:', publicUrl);

        return publicUrl;

    } catch (error) {
        toast.error("File upload failed");

        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error("🚧 CORS ERROR DETECTED 🚧");
            console.error("This is likely due to missing CORS configuration on your AWS S3 Bucket.");
            console.error("Please follow the instructions in AWS_S3_CORS_SETUP.md");
        }

        if (error.message?.includes('AccessDenied')) {
            console.error("🔐 ACCESS DENIED - Check your AWS credentials and bucket permissions.");
        }

        throw error;
    }
};
