// src/types/express.d.ts
import { IUserDocument } from "../models/user.js"; // or your user interface

/**
 * ===========================
 * Express Request Typing
 * ===========================
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
