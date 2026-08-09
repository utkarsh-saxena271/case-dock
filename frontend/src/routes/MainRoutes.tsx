import { Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import AuthLayout from '../pages/auth/AuthLayout'

const MainRoutes = () => {
  return (
    <Routes>
      <Route path='/auth' element={<AuthLayout/>}>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='verify-email' element={<VerifyEmail />} />
        <Route path='forgot-password' element={<ForgotPassword />} />
        <Route path='reset-password' element={<ResetPassword />} />
      </Route>

    </Routes>
  )
}

export default MainRoutes