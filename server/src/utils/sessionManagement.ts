import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { UserObject } from "@/controllers/auth.controller.js";

export function hashJti(jti: string) {
  return crypto.createHash("sha256").update(jti).digest("hex");
}

export const GenerateAccessToken = (user: UserObject) => {
  const payload = {
    _id: user._id,
    email: user.email,
    name: user.name,
  };
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_TTL ||
      "15m") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, options);
};

export const GenerateRefreshToken = (payload: object) => {
  const jti = uuidv4();
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_TTL ||
      "30d") as jwt.SignOptions["expiresIn"],
  };
  const refreshToken = jwt.sign(
    { user: payload, jti },
    process.env.REFRESH_TOKEN_SECRET!,
    options
  );
  const hashedJti = hashJti(jti);
  return { refreshToken, hashedJti };
};

export const VerifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
};

export const VerifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
};
