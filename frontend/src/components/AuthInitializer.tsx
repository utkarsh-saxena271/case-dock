import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../store/store"
import { refreshAccessToken, fetchMe } from "../store/actions/authActions"
import OpeningLoader from "./OpeningLoader"

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
                await dispatch(fetchMe())
            } catch (error) {
                console.log('No active session')
            } finally {
                setRefreshing(false)
            }
        }

        check()
    }, [])

    if (refreshing) {
        return <OpeningLoader />
    }

    return <>{children}</>
}

export default AuthInitializer