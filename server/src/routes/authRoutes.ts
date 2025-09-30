import {
  Login,
  Logout,
  Refresh,
  Register,
  VerifyUser,
} from "@/controllers/auth.controller.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", Register);
authRouter.post("/login", Login);
authRouter.get("/verify", VerifyUser);
authRouter.post("/refresh", Refresh);
authRouter.post("/logout", Logout);

export default authRouter;
