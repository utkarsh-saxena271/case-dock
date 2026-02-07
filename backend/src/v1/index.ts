import { Router } from "express"
import authRoutes from "./routes/auth.routes.js"
import chamberRoutes from "./routes/chamber.routes.js"
import caseRoutes from "./routes/case.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/chambers", chamberRoutes)
router.use("/cases", caseRoutes)

export default router