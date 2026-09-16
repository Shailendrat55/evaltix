import { UserPayload } from "./authRequest";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}