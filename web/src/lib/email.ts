import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otpCode: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Wonderer App" <noreply@wonderer.com>',
    to,
    subject: "Your Registration Verification Code",
    text: `Your One-Time Password (OTP) for registration is: ${otpCode}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #06b6d4;">Verify Your Email</h2>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your registration:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #111827;">${otpCode}</h1>
        </div>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280;">If you did not request this email, please ignore it.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
