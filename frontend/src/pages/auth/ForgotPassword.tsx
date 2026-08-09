import React, { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store/store"
import { forgotPassword } from "../../store/actions/authActions"

const ForgotPassword = () => {
    const [email, setEmail] = useState<string>("")
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
    const [error, setError] = useState<string | null>(null)

    const dispatch = useDispatch<AppDispatch>()

    const forgetPasswordHandler = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setStatus("loading")
            await dispatch(forgotPassword({ email }))
            setStatus("success")
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('Forget Password failed')
            }
            console.log(error)
        }
    }
    return (
        <>
            {error && <div>{error}</div>}
            {status == 'success' && <div>Check your Registered Email</div>}
            {status == 'loading' && <div>Loading...</div>}
            <form onSubmit={forgetPasswordHandler}>
                <input
                    disabled={status==='success'}
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}
                    placeholder="email" />
                <button disabled={status==='success'}>
                    Send Mail
                </button>
            </form>
            
        </>
    )
}

export default ForgotPassword