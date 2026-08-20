import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from 'http'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { envConfig } from "../config/env.config.js";
import { registerSocket, removeSocket } from "./socketManager.js";

const initWebsocketServer = (server: Server) => {
    const wss = new WebSocketServer({
        server,
        path: '/ws'
    })

    wss.on('connection', (socket) => {
        let authenticated = false
        let userId: string | null = null

        const authTimer = setTimeout(() => { 
            if (!authenticated) socket.close(4001, 'Auth timeout') 
        }, 5000)

        socket.on('message', (raw) => {
            if(authenticated) return

            try {
                const msg = JSON.parse(raw.toString())
                if(msg.type !== 'AUTH' || !msg.token){
                    return
                }
                try {
                    const decoded = jwt.verify(msg.token, envConfig.ACCESS_TOKEN_SECRET) as JwtPayload
                    userId = decoded.userId;
                    if(!userId){ 
                        return
                    }
                    authenticated = true
                    clearTimeout(authTimer)
                    registerSocket(userId, socket)
                } catch (error) {
                    socket.close(4002, 'Invalid token')
                }
            } catch (error) {
                socket.close()
                return
            }
        })

        socket.on('close', () => {
            clearTimeout(authTimer)
            if(userId) removeSocket(userId, socket)
        })
    })
    return wss
}

export default initWebsocketServer
