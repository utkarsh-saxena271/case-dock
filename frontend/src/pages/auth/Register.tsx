import { useState } from "react"
import { useDispatch } from "react-redux"
import { registerUser } from "../../store/actions/authActions"
import type { AppDispatch } from "../../store/store"
import { Link, useNavigate } from "react-router-dom"

const Register = () => {

    const [firstName, setfirstName] = useState<string>("")
    const [lastName, setlastName] = useState<string>("")
    const [userName, setuserName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [enrollment, setenrollment] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const [error, setError] = useState<string | null>(null)

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const registerHandler = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {

            const payload = {
                fullName: {
                    firstName, lastName
                },
                userName,
                email,
                enrollmentNumber: enrollment,
                password
            }
            await dispatch(registerUser(payload))
            navigate('/verify-email')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('Registration failed')
            }
            console.error('Registration failed:', error)
        }
    }
    return (
        <>
            {error && <div>{error}</div>}
            <form onSubmit={registerHandler}>
                <div>
                    <input type="text"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setfirstName(e.target.value)}
                        value={firstName}
                        placeholder="firstname" />
                    <input type="text"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setlastName(e.target.value)}
                        value={lastName}
                        placeholder="lastname" />
                </div>
                <input
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setuserName(e.target.value)}
                    value={userName}
                    placeholder="username" />
                <input
                    type="email"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    value={email}
                    placeholder="email" />
                <input
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setenrollment(e.target.value)}
                    value={enrollment}
                    placeholder="enrollment number" />
                <input
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    value={password}
                    placeholder="password" />

                <button>Register</button>
            </form>
            <p>Already have a account? <Link to="/login">Login</Link></p>
        </>
    )
}

export default Register