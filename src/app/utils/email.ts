import sgMail from "@sendgrid/mail";

import {
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from "../constants/emailTemplates";

export type ContactEmailData = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  unit_number?: string;
  unit_id?: string;
  address?: string;
};

export type VerificationEmailData = {
  lang: "en" | "ko";
  toEmail: string;
  verificationUrl: string;
};

export type ResetPasswordEmailData = {
  toEmail: string;
  password: string;
};

// SendGrid API Key 설정
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail({
  toEmail,
  verificationUrl,
}: VerificationEmailData): Promise<boolean> {
  const subject = "[CMNY] Please verify your email address";
  const textContent = `Please verify your email address by clicking the following link:\n${verificationUrl}`;
  const htmlContent = getVerificationEmailTemplate(verificationUrl);

  try {
    const msg = {
      to: toEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: "CMNY",
      },
      subject,
      html: htmlContent,
      text: textContent,
    };

    await sgMail.send(msg);
    return true;
  } catch (error: any) {
    console.error("Failed to send verification email:", error);
    throw new Error(error.message || "Failed to send verification email.");
  }
}

export async function sendResetPasswordEmail({
  toEmail,
  password,
}: ResetPasswordEmailData): Promise<boolean> {
  const subject = "[CMNY] Your password has been reset";

  const htmlContent = getResetPasswordEmailTemplate(password);
  const textContent = `Your new password is: ${password}`;

  try {
    const msg = {
      to: toEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: "CMNY",
      },
      subject,
      html: htmlContent,
      text: textContent,
    };

    await sgMail.send(msg);
    return true;
  } catch (error: any) {
    console.error("Failed to send reset password email:", error);
    throw new Error(error.message || "Failed to send reset password email.");
  }
}
