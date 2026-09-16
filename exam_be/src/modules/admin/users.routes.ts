import { Router } from "express";
import { createUserHandler, getAllCandidatesHandler, listUsersHandler, patchUserHandler } from "./users.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/", createUserHandler);
router.get("/", listUsersHandler);
router.patch("/:id", patchUserHandler);
router.get("/candidates", authenticate, getAllCandidatesHandler);

export default router;
