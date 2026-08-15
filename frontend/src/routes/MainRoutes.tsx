import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Landing from '../pages/Landing'
import AuthLayout from '../pages/auth/AuthLayout'
import ProtectedRoute from './ProtectedRoute'

const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))

const ChamberList = lazy(() => import('../pages/chambers/ChamberList'))
const CreateChamber = lazy(() => import('../pages/chambers/CreateChamber'))
const DiscoverChambers = lazy(() => import('../pages/chambers/DiscoverChambers'))
const EditChamber = lazy(() => import('../pages/chambers/EditChamber'))
const EditMember = lazy(() => import('../pages/chambers/EditMember'))
const ChamberDetails = lazy(() => import('../pages/chambers/ChamberDetails'))

const CaseList = lazy(() => import('../pages/cases/CaseList'))
const CreateCase = lazy(() => import('../pages/cases/CreateCase'))
const CaseDetails = lazy(() => import('../pages/cases/CaseDetails'))

const Dashboard = lazy(() => import('../pages/Dashboard'))

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
    Loading...
  </div>
)

const MainRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          <Route path="/dashboard" element={<Dashboard />} />
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
    </Suspense>
  )
}

export default MainRoutes