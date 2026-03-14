import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith('@ku.th')) {
      return NextResponse.json({ error: 'Registration is restricted to @ku.th email addresses only.' }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ error: 'User already exists and is verified. Please login.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
      },
      create: {
        name,
        email,
        passwordHash,
      },
    });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.upsert({
      where: { email },
      update: {
        otp: otpCode,
        expiresAt,
      },
      create: {
        email,
        otp: otpCode,
        expiresAt,
      },
    });

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await sendOtpEmail(email, otpCode);
      } else {
        console.log("========================================");
        console.log(`[AUTH] OTP for ${email} is: ${otpCode}`);
        console.log("========================================");
      }
    } catch (emailErr: any) {
      console.error("SMTP Error:", emailErr.message);
      console.log("========================================");
      console.log(`[AUTH-FALLBACK] OTP for ${email} is: ${otpCode}`);
      console.log("========================================");
      // We don't throw here, so the user can still proceed if they check logs
    }

    return NextResponse.json({ 
      message: 'Registration initiated. Please check your email (or server logs if SMTP fails).', 
      email: user.email, 
      verifyPending: true 
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
