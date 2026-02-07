import ImageKit from "imagekit";
import fs from "fs";
import {
    IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT
} from "../utils/env.util.js";

// Initialize ImageKit instance
let imagekit: ImageKit | null = null;

if (IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
} else {
    console.warn("⚠️ ImageKit credentials missing. File uploads will fail.");
}

export const uploadImageKit = async (localFilePath: string, fileName: string): Promise<any> => {
    try {
        if (!localFilePath) {
            return null;
        }

        if (!imagekit) {
            throw new Error("ImageKit not configured");
        }

        const fileBuffer = fs.readFileSync(localFilePath);

        const response = await imagekit.upload({
            file: fileBuffer, // required
            fileName: fileName, // required
            useUniqueFileName: true,
        });

        // Remove local file after upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        // Remove local file if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};
