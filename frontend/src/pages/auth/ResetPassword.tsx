import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { AppDispatch } from "../../store/store"
import { resetPassword } from "../../store/actions/authActions"

const ResetPassword = () => {
    const [password, setPassword] = useState<string>('')
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(token ? 'idle' : 'error')
    const [error, setError] = useState<string | null>(token ? null : 'No reset token found')

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const resetPasswordHandler = async (e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if(!token) return
            setStatus('loading')
            await dispatch(resetPassword({token,password}))
            setStatus('success')
            setTimeout(() => {
                navigate('/login')
            }, 2000);
        } catch (error) {
            setStatus('error')
            if(error instanceof Error){
                setError(error.message)
            }else{
                setError('Resetting password failed')
            }
            console.log(error)
        }
    }
  return (
    <>  
        {status === 'error' && <div>{error}</div>}
        {status === 'loading' && <div>loading...</div>}
        {status === 'success' && <div>Password reset successfully</div>}
        <form onSubmit={resetPasswordHandler}>
            <input 
            onChange={(e:React.ChangeEvent<HTMLInputElement>) => {setPassword(e.target.value)}}
            value={password}
            type="password" 
            placeholder="new password"/>
            <button>reset password</button>
        </form>
    </>
  )
}

export default ResetPassword