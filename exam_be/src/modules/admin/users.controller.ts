import { Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { createUserSchema, patchUserSchema, listUsersQuerySchema, getallCandidates } from "./users.validation";
import { AuthenticatedRequest } from "../../types/authRequest";

export async function createUserHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createUserSchema.parse(req.body);
    const actorId = req.user!.sub;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await usersService.createUser(input, actorId, ipAddress);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listUsersHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const result = await usersService.listUsers(query.page, query.limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function patchUserHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const input = patchUserSchema.parse(req.body);
    const actorId = req.user!.sub;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const user = await usersService.updateUserStatus(id, input.isActive, actorId, ipAddress);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getAllCandidatesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const candidates = await usersService.getallCandidates();
    res.json({ candidates });
  } catch (err) {
    next(err);
  }
}