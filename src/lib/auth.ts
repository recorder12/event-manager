// src/lib/auth.ts
import bcrypt from "bcryptjs";
import { User, UserStatus } from "@/app/models/user";
import dbConnect from "./mongodb";

export const AuthErrors = {
  EMAIL_PASSWORD_REQUIRED: "Email and password are required",
  USER_TYPE_REQUIRED: "User type is required",
  NAME_REQUIRED: "First name and last name are required",
  USER_NOT_FOUND: "User not found",
  INCORRECT_EMAIL_OR_PASSWORD: "Incorrect email or password",
  EMAIL_NOT_VERIFIED: "Email not verified",
  USER_INACTIVE: "User is inactive",
};

export async function authenticateUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  if (!email || !password) {
    throw new Error(AuthErrors.EMAIL_PASSWORD_REQUIRED);
  }

  await dbConnect();

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error(AuthErrors.USER_NOT_FOUND);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error(AuthErrors.INCORRECT_EMAIL_OR_PASSWORD);
  }

  if (user.email_verified === false) {
    throw new Error(AuthErrors.EMAIL_NOT_VERIFIED);
  }

  if (user.status === UserStatus.INACTIVE) {
    throw new Error(AuthErrors.USER_INACTIVE);
  }

  // ✅ NextAuth에서는 이 객체가 JWT에 들어가고 session.user에도 노출됨
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    status: user.status,
  };
}
