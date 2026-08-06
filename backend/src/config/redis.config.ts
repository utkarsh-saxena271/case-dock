import { createClient } from "redis";
import { envConfig } from "./env.config.js"

const REDIS_URL = envConfig.REDIS_URL

const client = createClient({
    url : REDIS_URL
})

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', ()=>console.log('redis connected'))

export default client