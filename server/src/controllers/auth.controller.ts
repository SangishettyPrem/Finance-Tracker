import { Session } from "@/models/session.js";
import { User } from "@/models/user.js";
import logger from "@/utils/logger.js";
import {
  GenerateAccessToken,
  GenerateRefreshToken,
  hashJti,
  VerifyAccessToken,
  VerifyRefreshToken,
} from "@/utils/sessionManagement.js";
import { loginSchema, registerSchema } from "@/validations/authValidations.js";
import { CookieOptions, Request, Response } from "express";
import mongoose from "mongoose";
import ms from "ms";

interface JwtPayload {
  _id: string;
  email: string;
  name: string;
}

interface UserPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
}

interface JwtRefreshPayload {
  user: UserPayload;
  jti: string;
}

export interface UserObject {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

const options: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

const isHttpOptionsFalse: CookieOptions = {
  httpOnly: false,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const Register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerSchema.safeParseAsync({
      name,
      email,
      password,
    });
    if (!result.success) {
      const messages = result.error.issues[0].message;
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    const isUserExmailExists = await User.findOne({ email });
    if (isUserExmailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    await User.create({ name, email, password });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error("Failed to Register");
    logger.error({ err }, "Error while registering user:");
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to Register",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginSchema.safeParseAsync({ email, password });
    if (!result.success) {
      const messages = result.error.issues[0].message;
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    let hashedJti: string;
    let refreshToken: string;
    let accessToken: string;
    try {
      const result = GenerateRefreshToken(user);
      hashedJti = result.hashedJti;
      refreshToken = result.refreshToken;
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error : new Error("Failed to Register");
      logger.error({ err }, "Error while generating refresh token:");
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal Server Error",
      });
    }
    try {
      accessToken = GenerateAccessToken(user);
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to Generate Access Token");
      logger.error({ err }, "Failed to Generate Access Token");
      return res.status(500).json({
        success: false,
        message: err?.message || "Internal Server Error",
      });
    }
    await Session.create({
      userId: user._id,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip,
      refreshTokenHash: hashedJti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      revokedAt: null,
    });

    if (!process.env.ACCESS_TOKEN_TTL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    } else if (!process.env.REFRESH_TOKEN_TTL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const accessTTL = (process.env.ACCESS_TOKEN_TTL || "1m") as string;
    const refreshTTL = (process.env.REFRESH_TOKEN_TTL || "7d") as string;

    const AccessmaxAge = ms(accessTTL as ms.StringValue);
    const RefreshmaxAge = ms(refreshTTL as ms.StringValue);

    if (typeof AccessmaxAge !== "number") {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    } else if (typeof RefreshmaxAge !== "number") {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }
    res.cookie("refresh_token", refreshToken, {
      ...options,
      maxAge: RefreshmaxAge,
    });
    res.cookie("access_token", accessToken, {
      ...options,
      maxAge: AccessmaxAge,
    });
    res.cookie("is-logged-in", true, {
      ...isHttpOptionsFalse,
      maxAge: RefreshmaxAge,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Failed to Login");
    logger.error({ err }, " Error while logging in");
    return res.status(500).json({
      success: false,
      message: err.message || "Error while logging in",
    });
  }
};

export const Refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] || req.headers.authorization?.split(" ")[1];
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Missing refresh token" });
    }
    let payload;
    try {
      payload = VerifyRefreshToken(refreshToken) as JwtRefreshPayload;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Invalid Token");
      return res.status(400).json({ message: err?.message || "Invalid token" });
    }
    const { jti, user } = payload;
    const HashJti = hashJti(jti);
    const session = await Session.findOne({
      refreshTokenHash: HashJti,
      userId: user?._id,
    }).exec();
    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: "Token not found" });
    }

    // revoke old session
    session.isRevoked = true;
    session.revokedAt = new Date();
    await session.save();

    // create new session
    const { refreshToken: newRefreshToken, hashedJti: newHashJti } =
      GenerateRefreshToken(user);
    const newSession = await Session.create({
      userId: user?._id,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip,
      refreshTokenHash: newHashJti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    // issue new access token
    const newAccessToken = GenerateAccessToken(user);

    if (!process.env.ACCESS_TOKEN_TTL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    } else if (!process.env.REFRESH_TOKEN_TTL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const accessTTL = (process.env.ACCESS_TOKEN_TTL || "1m") as string;
    const refreshTTL = (process.env.REFRESH_TOKEN_TTL || "7d") as string;

    const AccessmaxAge = ms(accessTTL as ms.StringValue);
    const RefreshmaxAge = ms(refreshTTL as ms.StringValue);

    if (typeof AccessmaxAge !== "number") {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    } else if (typeof RefreshmaxAge !== "number") {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }
    // set cookies
    res.cookie("refresh_token", newRefreshToken, {
      ...options,
      maxAge: RefreshmaxAge,
    });
    res.cookie("access_token", newAccessToken, {
      ...options,
      maxAge: AccessmaxAge,
    });

    return res.json({
      success: true,
      sessionId: newSession._id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Failed to Refresh");
    logger.error({ err }, "Error while refreshing token:");
    res.status(500).json({
      success: false,
      message: err?.message || "Error while refreshing token",
    });
  }
};

export const VerifyUser = async (req: Request, res: Response) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.status(500).json({
        message: "Server configuration error",
        success: false,
      });
    }
    let decoded: JwtPayload | null = null;
    try {
      decoded = VerifyAccessToken(token) as JwtPayload;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Invalid Token");
      logger.error({ err }, "Error while verifying user:");
      return res.status(401).json({
        success: false,
        message: err?.message || "Invalid or expired token",
      });
    }
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const user = await User.findById(decoded?._id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "User verified",
      user,
    });
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error : new Error("Failed to Verify User");
    logger.error({ err }, "Error while verifying user:");
    return res.status(500).json({
      message: err?.message || "Failed to Verify User",
      success: false,
    });
  }
};

export const Logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refresh_token", options);
    res.clearCookie("access_token", options);
    res.clearCookie("is-logged-in", isHttpOptionsFalse);
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Failed to Logout");
    logger.error({ err }, "Error while Logout:");
    return res.status(500).json({
      message: err?.message || "Failed to Logout",
      success: false,
    });
  }
};
