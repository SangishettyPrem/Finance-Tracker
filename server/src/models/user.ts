import mongoose, { Document, Model } from "mongoose";
import * as argon from "argon2";

/**
 * ===========================
 * Types & Interfaces
 * ===========================
 */

// Base user fields
export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Instance methods
export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

// Full document type (fields + methods + mongoose doc)
export type IUserDocument = Document & IUser & IUserMethods;

// Model type (generic: document + methods)
export type UserModel = Model<IUser, object, IUserMethods>;

/**
 * ===========================
 * Schema Definition
 * ===========================
 */

const schema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
    },
  },
  { timestamps: true }
);

/**
 * ===========================
 * Instance Methods
 * ===========================
 */

schema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return argon.verify(this.password, password);
};

/**
 * ===========================
 * Middleware
 * ===========================
 */

schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await argon.hash(this.password);
  }
  next();
});

/**
 * ===========================
 * Model
 * ===========================
 */
export const User = mongoose.model<IUser, UserModel>("User", schema);
