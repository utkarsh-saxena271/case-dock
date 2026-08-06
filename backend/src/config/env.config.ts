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
    REDIS_URL:requireEnv('REDIS_URL')
}