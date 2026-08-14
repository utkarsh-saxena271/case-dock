import { Route, Routes } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import AuthLayout from '../pages/auth/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import ChamberList from '../pages/chambers/ChamberList'
import CreateChamber from '../pages/chambers/CreateChamber'
import DiscoverChambers from '../pages/chambers/DiscoverChambers'
import EditChamber from '../pages/chambers/EditChamber'
import EditMember from '../pages/chambers/EditMember'
import ChamberDetails from '../pages/chambers/ChamberDetails'
import CaseList from '../pages/cases/CaseList'
import CreateCase from '../pages/cases/CreateCase'
import CaseDetails from '../pages/cases/CaseDetails'

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path='/auth' element={<AuthLayout />}>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='verify-email' element={<VerifyEmail />} />
        <Route path='forgot-password' element={<ForgotPassword />} />
        <Route path='reset-password' element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/chamber" element={<ChamberList />} />
        <Route path="/chamber/create" element={<CreateChamber />} />
        <Route path="/chamber/discover" element={<DiscoverChambers />} />
        <Route path="/chamber/:chamberId/edit/:membershipId" element={<EditMember />} />
        <Route path="/chamber/:chamberId/edit" element={<EditChamber />} />
        <Route path="/chamber/:chamberId" element={<ChamberDetails />} />

        <Route path="/case" element={<CaseList />} />
        <Route path="/case/create" element={<CreateCase />} />
        <Route path="/case/:caseId" element={<CaseDetails />} />
      </Route>
    </Routes>
  )
}

export default MainRoutes