import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser } from "../../store/actions/authActions"
import type { AppDispatch, RootState } from "../../store/store"

const Login = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const dispatch = useDispatch<AppDispatch>()

    const emailHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setEmail(target.value)
    }
    const passwordHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setPassword(target.value)
    }
    const loginHandler = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setEmail('')
            setPassword('')
            await dispatch(loginUser({ email, password }))
            console.log('logged in')
        } catch (error) {
            console.error('Login failed:', error)
        }
    }
    const user = useSelector((state: RootState) => state.auth.user)
    console.log(user)


    return (
        <>
        <form onSubmit={loginHandler}>
            <input onChange={emailHandler} value={email} type="text" placeholder="email" />
            <input onChange={passwordHandler} value={password} type="text" placeholder="password" />
            <button>
                login
            </button>
        </form>
            {user && <p>Logged in as: {user.firstName}</p>}
        </>
    )
}

export default Login