export const connectSocket = (accessToken: string, onForceLogout: () => void) => {
    const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws`)

    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: 'AUTH',
            token: accessToken
        }))
    }

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data)
            if (data.type === 'FORCE_LOGOUT') {
                onForceLogout()
            }
        } catch (error) {
            // ignore malformed messages
        }
    }

    return socket
}