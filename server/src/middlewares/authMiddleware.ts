import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { GraphQLError } from "graphql";

interface AuthContext {
  req: Request;
  res: Response;
  user: null | {
    _id: string;
    email: string;
    name: string;
  };
  message?: string;
}

interface DecodedUser extends JwtPayload {
  _id: string;
  email: string;
  name: string;
}

export const isAuthenticated = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<AuthContext> => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      throw new GraphQLError("Token not provided", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new GraphQLError("Server misconfiguration", {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
      });
    }

    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      ) as DecodedUser;
    } catch (error: unknown) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new GraphQLError(
        error instanceof Error ? error.message : "Invalid or Expired Token",
        {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        }
      );
    }
    return {
      req,
      res,
      user: {
        _id: decoded._id,
        email: decoded.email,
        name: decoded.name,
      },
    };
  } catch (error: unknown) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    throw new GraphQLError(
      error instanceof Error ? error.message : "Authentication failed",
      {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      }
    );
  }
};
