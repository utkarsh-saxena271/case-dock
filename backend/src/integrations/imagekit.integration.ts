import ImageKit from '@imagekit/nodejs';
import { envConfig } from '../config/env.config.js';

const imagekit = new ImageKit({
    privateKey: envConfig.IMAGEKIT_PRIVATE_KEY,
});

export default imagekit;