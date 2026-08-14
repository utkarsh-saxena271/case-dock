import { useSelector } from "react-redux"
import type { RootState } from "../store/store"
import { Navigate, Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

const ProtectedRoute = () => {
    const user = useSelector((state: RootState) => state.auth.user)
    if (!user) return <Navigate to={'/auth/login'} />
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    )
}

export default ProtectedRoute