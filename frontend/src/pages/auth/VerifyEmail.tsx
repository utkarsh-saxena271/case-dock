import { useDispatch } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { AppDispatch } from "../../store/store"
import { useEffect, useState } from "react"
import { verifyEmail } from "../../store/actions/authActions"

const VerifyEmail = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')
    const [error, setError] = useState<string | null>(token ? null : 'No verification token found')
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) return // nothing to do, already reflected in initial state above

        const verify = async () => {
            try {
                await dispatch(verifyEmail(token))
                setStatus('success')
                setTimeout(() => navigate('/login'), 2000)
            } catch (error) {
                setStatus('error')
                if (error instanceof Error) {
                    setError(error.message)
                } else {
                    setError('Verification failed')
                }
            }
        }

        verify()
    }, [])

    return (
        <>
            {status === 'loading' && <p>Verifying your email...</p>}
            {status === 'success' && <p>Email verified! You can now log in.</p>}
            {status === 'error' && <div>{error}</div>}
        </>
    )
}

export default VerifyEmail