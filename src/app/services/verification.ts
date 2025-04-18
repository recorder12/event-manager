import { randomBytes } from "crypto";
import { EmailVerification } from "../models/emailVerification";
import { User } from "../models/user";
import { sendVerificationEmail } from "../utils/email";

export const VerificationErrors = {
  CODE_NOT_FOUND: "Verification code not found",
  USER_NOT_FOUND: "User not found",
  FAIL_TO_CREATE_VERIFICATION: "Failed to create verification",
};

type VerifyEmailInput = {
  code: string;
};

type SendVerificationEmailInput = {
  email: string;
};

export async function createEmailVerification({
  email,
}: SendVerificationEmailInput) {
  try {
    const generateVerificationCode = (length = 14) => {
      const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const bytes = randomBytes(length);
      return Array.from(bytes)
        .map((byte) => charset[byte % charset.length])
        .join("");
    };

    const verificationCode = generateVerificationCode(); // 예: 'A8rX2dLq'

    const verification = await EmailVerification.create({
      email,
      code: verificationCode,
    });

    if (!verification) {
      throw new Error(VerificationErrors.FAIL_TO_CREATE_VERIFICATION);
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/email?code=${verificationCode}`;

    await sendVerificationEmail({
      lang: "en",
      toEmail: email,
      verificationUrl,
    });

    return;
  } catch (error) {
    throw error;
  }
}

export async function verifyEmail({ code }: VerifyEmailInput) {
  try {
    const verification = await EmailVerification.findOne({ code });
    if (!verification) {
      throw new Error("Verification code not found");
    }

    const { email } = verification;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    user.email_verified = true;
    await user.save();
    await EmailVerification.deleteOne({ code });
    return;
  } catch (error) {
    throw error;
  }
}
