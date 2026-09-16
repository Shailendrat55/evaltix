import { Router } from "express";
import { loginHandler, refreshHandler, logoutHandler, meHandler } from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";
import { loginRateLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/login", loginRateLimiter, loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", authenticate, meHandler);

export default router;