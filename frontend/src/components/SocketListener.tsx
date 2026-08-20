import { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store/store"
import { clearCredentials } from "../store/slices/authSlice"
import { connectSocket } from "../services/socket"

const SocketListener = () => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken)
    const isAuthenticated = useSelector((state: RootState) => !!state.auth.user)
    const dispatch = useDispatch<AppDispatch>()
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (!accessToken) return

        socketRef.current = connectSocket(accessToken, () => {
            dispatch(clearCredentials())
        })

        return () => {
            socketRef.current?.close()
            socketRef.current = null
        }
    }, [isAuthenticated])

    return null
}

export default SocketListener