import * as uuid from "short-uuid";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User, UserRole, UserStatus } from "../models/user.schema";
import { createEmailVerification } from "./verification";
import { sendResetPasswordEmail } from "../utils/email";

type SignUpInput = {
  email: string;
  password: string;
  last_name: string;
  first_name: string;
  referenceCode?: string;
};

type ResetPasswordInput = {
  email: string;
};

type GetProfileInput = {
  userId: string;
};

type GetProfileOutput = {
  email: string;
  first_name: string;
  last_name: string;
  profile: string;
};

type EditProfileInput = {
  userId: string;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  phone_number?: string;
  profile_picture?: string;
  profile?: string;
};

type SetPasswordInput = {
  userId: string;
  password: string;
};

export const SignUpErrors = {
  INVALID_EMAIL: "Invalid email",
  PASSWORD_LENGTH: "Password must be at least 8 characters",
  EMAIL_EXISTS: "Email already exists",
  EMAIL_PASSWORD_REQUIRED: "Email and password are required",
  USER_TYPE_REQUIRED: "User type is required",
  NAME_REQUIRED: "First name and last name are required",
  INVALIDE_SECRET_CODE: "Invalid secret code",
  FAIL_TO_CREATE_USER: "Failed to create user",
};

export const ResetPasswordErrors = {
  INVALID_EMAIL: "Invalid email",
  USER_TYPE_REQUIRED: "User type is required",
};

export const ProfileErrors = {
  INVALID_ID: "Invalid email",
  USER_TYPE_REQUIRED: "User type is required",
  USER_NOT_FOUND: "User not found",
  USER_INACTIVE: "User is inactive",
};

export const setNewPasswordErrors = {
  INVALID_ID: "Invalid email",
  USER_TYPE_REQUIRED: "User type is required",
  USER_NOT_FOUND: "User not found",
  USER_INACTIVE: "User is inactive",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_LENGTH: "Password must be at least 8 characters",
};

export async function signUp(signUpInput: SignUpInput): Promise<void> {
  try {
    const { email, password, last_name, first_name, referenceCode } =
      signUpInput;

    if (!email || !password) {
      throw new Error(SignUpErrors.EMAIL_PASSWORD_REQUIRED);
    }

    if (!last_name || !first_name) {
      throw new Error(SignUpErrors.NAME_REQUIRED);
    }

    if (!email.includes("@")) {
      throw new Error(SignUpErrors.INVALID_EMAIL);
    }

    if (password.length < 8) {
      throw new Error(SignUpErrors.PASSWORD_LENGTH);
    }

    await dbConnect();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ email });
    if (user) {
      throw new Error(SignUpErrors.EMAIL_EXISTS);
    }

    const newUser = await User.create({
      email,
      password: hashedPassword,
      last_name,
      first_name,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    // send verification email
    if (!newUser) {
      throw new Error(SignUpErrors.FAIL_TO_CREATE_USER);
    }

    await createEmailVerification({
      email,
    });

    return;
  } catch (error) {
    throw error;
  }
}

export async function getProfile({
  userId,
}: GetProfileInput): Promise<GetProfileOutput> {
  try {
    if (!userId) {
      throw new Error(ProfileErrors.INVALID_ID);
    }

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      throw new Error(ProfileErrors.USER_NOT_FOUND);
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new Error(ProfileErrors.USER_INACTIVE);
    }

    return {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile: user.profile,
    };
  } catch (error) {
    throw error;
  }
}

export async function editProfile(editProfileInput: EditProfileInput) {
  const { userId, ...updateData } = editProfileInput;
  try {
    if (!userId) {
      throw new Error(ProfileErrors.INVALID_ID);
    }

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      throw new Error(ProfileErrors.USER_NOT_FOUND);
    }

    Object.assign(user, updateData);

    await user.save();

    return;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword({
  email,
}: ResetPasswordInput): Promise<void> {
  try {
    if (!email) {
      throw new Error(SignUpErrors.INVALID_EMAIL);
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(SignUpErrors.INVALID_EMAIL);
    }

    const newPassword = uuid.generate();

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    // send email with new password
    await sendResetPasswordEmail({
      toEmail: email,
      password: newPassword,
    });

    return;
  } catch (error) {
    throw error;
  }
}

export async function setNewPassword({
  userId,
  password: newPassword,
}: SetPasswordInput) {
  try {
    if (!userId) {
      throw new Error(setNewPasswordErrors.INVALID_ID);
    }

    if (!newPassword) {
      throw new Error(setNewPasswordErrors.PASSWORD_REQUIRED);
    }
    if (newPassword.length < 8) {
      throw new Error(setNewPasswordErrors.PASSWORD_LENGTH);
    }

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      throw new Error(setNewPasswordErrors.USER_NOT_FOUND);
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new Error(setNewPasswordErrors.USER_INACTIVE);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    return;
  } catch (error) {
    throw error;
  }
}
