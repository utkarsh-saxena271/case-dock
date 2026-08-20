import type { WebSocket } from "ws";

const userSockets = new Map<string, Set<WebSocket>>();

export const registerSocket = (userId: string, socket: WebSocket) => {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket);
}

export const removeSocket = (userId:string, socket:WebSocket) => {
    const sockets = userSockets.get(userId)
    if(!sockets){
        return
    }

    sockets.delete(socket)

    if(sockets.size === 0){
        userSockets.delete(userId);
    }
}

export const forceLogoutUser = (userId:string) => {
    const sockets = userSockets.get(userId)
    if(!sockets) return

    for(const socket of sockets){
        try {
            socket.send(JSON.stringify({
                type:'FORCE_LOGOUT'
            }))

            socket.close(4003, 'Session revoked')
        } catch (error) {
            
        }
    }
    userSockets.delete(userId)
}