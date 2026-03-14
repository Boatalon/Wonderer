import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'No OTP requested for this email' }, { status: 400 });
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // Clean up used OTP
    await prisma.otp.delete({
      where: { email },
    });

    return NextResponse.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
