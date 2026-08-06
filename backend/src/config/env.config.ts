import 'dotenv/config'

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing env variable: ${key}`);
    return value;
}

export const envConfig = {
    PORT: requireEnv("PORT"),
    NODE_ENV: requireEnv("NODE_ENV"),
    JWT_SECRET:requireEnv("JWT_SECRET"),
    DATABASE_URL:requireEnv("DATABASE_URL"),
    REDIS_URL:requireEnv('REDIS_URL'),
    MAIL_HOST:requireEnv('MAIL_HOST'),
    MAIL_USER:requireEnv('MAIL_USER'),
    MAIL_PASS:requireEnv('MAIL_PASS'),
    EMAIL_VERIFY_SECRET:requireEnv('EMAIL_VERIFY_SECRET'),
    CLIENT_URL:requireEnv('CLIENT_URL'),
    ACCESS_TOKEN_SECRET:requireEnv('ACCESS_TOKEN_SECRET'),
    REFRESH_TOKEN_SECRET:requireEnv('REFRESH_TOKEN_SECRET')
}