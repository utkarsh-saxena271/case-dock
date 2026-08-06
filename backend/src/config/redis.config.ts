import { Redis } from 'ioredis'
import {envConfig} from './env.config.js'

const redis = new Redis(envConfig.REDIS_URL)

redis.on('connect', () => console.log('Connected to Redis'))
redis.on('error', (err) => console.error('Redis error:', err))

export default redis