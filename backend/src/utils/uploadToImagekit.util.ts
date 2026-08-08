import fs from 'fs/promises';
import fsSync from 'fs';
import imagekit from '../integrations/imagekit.integration.js';
import APIError from './apiError.util.js';

export const uploadToImageKit = async (filePath: string, fileName: string): Promise<{ url: string, fileId: string }> => {
    try {
        const response = await imagekit.files.upload(
            {
                file: fsSync.createReadStream(filePath),
                fileName,
            },
            { maxRetries: 3 }
        );

        await fs.unlink(filePath);

        if (!response.url || !response.fileId) {
            throw new APIError(500, "Upload succeeded but response was incomplete");
        }

        return { url: response.url, fileId: response.fileId };
    } catch (error) {
        await fs.unlink(filePath).catch(() => {});
        throw new APIError(500, "Failed to upload document, please try again");
    }
}