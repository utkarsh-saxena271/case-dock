import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../store/store"
import { refreshAccessToken } from "../store/actions/authActions"

interface Props {
    children: React.ReactNode
}

const AuthInitializer = ({ children }: Props) => {
    const [refreshing, setRefreshing] = useState(true)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        const check = async () => {
            try {
                await dispatch(refreshAccessToken())
            } catch (error) {
                console.log('No active session')
            } finally {
                setRefreshing(false)
            }
        }

        check()
    }, [])

    if (refreshing) {
        return <div>Loading...</div>
    }

    return <>{children}</>
}

export default AuthInitializer