import imagekit from '../integrations/imagekit.integration.js';
import APIError from './apiError.util.js';

export const deleteFromImagekit = async (fileId: string) => {
    try {
        const response = await imagekit.files.delete(fileId);   

        return response

    } catch (error) {
        throw new APIError(500, "Failed to delete document, please try again");
    }
}