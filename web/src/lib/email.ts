import nodemailer from "nodemailer";

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>OTP Verification</h2>
      <p>Your code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
  });
}