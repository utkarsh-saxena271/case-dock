import { useSelector } from "react-redux"
import type { RootState } from "../store/store"
import { Navigate, Outlet } from "react-router-dom"


const ProtectedRoute = () => {
    const user = useSelector((state:RootState) => state.auth.user)
    if(!user) return <Navigate to={'/auth/login'}/>
  return (
    <Outlet/>
  )
}

export default ProtectedRoute