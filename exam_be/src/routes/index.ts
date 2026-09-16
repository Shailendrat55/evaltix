import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import adminUsersRoutes from "../modules/admin/users.routes";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin/users", authenticate, requireRole("ADMIN"), adminUsersRoutes);

export default apiRouter;