export function getVerificationEmailTemplate(verificationUrl: string): string {
  const content = {
    title: "✉️ Verify your email address",
    greeting: "Hello,",
    intro:
      "Thank you for signing up for <strong>CMNY Event Management Service</strong>.",
    instruction:
      "Please verify your email address by clicking the button below:",
    button: "Verify Email",
    footer: "If you did not request this, you can safely ignore this email.",
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${content.title}</title>
      <style>
        body {
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
        }
        .wrapper {
          width: 100%;
          padding: 40px 0;
          display: flex;
          justify-content: center;
        }
        .container {
          background: #ffffff;
          max-width: 600px;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #1e40af;
          color: #ffffff;
          text-align: center;
          padding: 20px 30px;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          font-size: 16px;
          line-height: 1.6;
          color: #333333;
        }
        .content p {
          margin-bottom: 16px;
        }
        .button {
          display: inline-block;
          background-color: #1e40af;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          margin-top: 20px;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #153fa1;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #888888;
          background-color: #f9fafb;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">${content.title}</div>
          <div class="content">
            <p>${content.greeting}</p>
            <p>${content.intro}</p>
            <p>${content.instruction}</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button" style="color: white;">${content.button}</a>
            </p>
            <p>${content.footer}</p>
          </div>
          <div class="footer">© 2024 CMNY. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getResetPasswordEmailTemplate(password: string): string {
  const content = {
    title: "🔐 Your New Password",
    message:
      "Your password has been reset. Please use the following temporary password to log in and change it as soon as possible:",
    note: "If you did not request this, please contact support.",
    button: "Go to Login",
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${content.title}</title>
      <style>
        body {
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
        }
        .wrapper {
          width: 100%;
          padding: 40px 0;
          display: flex;
          justify-content: center;
        }
        .container {
          background: #ffffff;
          max-width: 600px;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #1e40af;
          color: #ffffff;
          text-align: center;
          padding: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
          font-size: 16px;
          color: #333;
          line-height: 1.6;
        }
        .password-box {
          background: #f9f9f9;
          padding: 12px 20px;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 20px auto;
          border-radius: 6px;
          border: 1px dashed #1e40af;
          color: #1e40af;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #888;
          background-color: #f9fafb;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">${content.title}</div>
          <div class="content">
            <p>${content.message}</p>
            <div class="password-box">${password}</div>
            <p>${content.note}</p>
          </div>
          <div class="footer">© 2024 CMNY. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
