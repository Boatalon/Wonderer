import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { put } from '@vercel/blob';
import { Client } from '@gradio/client';

export async function POST(req: Request) {
  try {
    const { length } = await req.json();

    if (!length || typeof length !== 'number') {
      return NextResponse.json({ error: 'Invalid protein length' }, { status: 400 });
    }

    const session = await auth();

    // Attempt to save request to database with PENDING status
    let generationRecord;
    try {
      generationRecord = await prisma.generation.create({
        data: {
          length,
          status: 'PENDING',
          ...(session?.user?.id ? { userId: session.user.id } : {}),
        },
      });
    } catch {
      console.warn("Database connection might be unavailable. Proceeding without DB.");
    }

    // Call Hugging Face API
    const hfSpaceUrl = process.env.HF_SPACE_URL;
    if (!hfSpaceUrl) {
      return NextResponse.json({ error: 'HF_SPACE_URL is not configured' }, { status: 500 });
    }

    // Using @gradio/client
    const client = await Client.connect(hfSpaceUrl);
    const result = await client.predict("/predict", { 
        length: length, 
    }) as any;

    const [statusText, pdbData] = result.data || []; 
    
    if (statusText && statusText.includes('failed')) {
        if(generationRecord) {
            await prisma.generation.update({
                where: { id: generationRecord.id },
                data: { status: 'FAILED' }
            });
        }
        throw new Error(statusText);
    }
    
    let blobUrl = null;

    if (pdbData && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
            const blob = await put(`pdb/generation_${generationRecord?.id || Date.now()}.pdb`, pdbData, {
                access: 'public',
                contentType: 'text/plain',
            });
            blobUrl = blob.url;
        } catch (error) {
            console.error("Failed to upload to Vercel Blob:", error);
        }
    }

    if(generationRecord) {
        await prisma.generation.update({
            where: { id: generationRecord.id },
            data: { 
                status: 'SUCCESS',
                ...(blobUrl ? { pdbUrl: blobUrl } : {})
            }
        });
    }

    // We still return the pdbData to the frontend for immediate rendering
    return NextResponse.json({ success: true, result: [statusText, pdbData] });

  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
