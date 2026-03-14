import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { put } from '@vercel/blob';
import { Client } from '@gradio/client';

export const maxDuration = 60; // Set timeout to 60 seconds (Vercel maximum for standard Pro)

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
    let hfSpaceUrl = process.env.HF_SPACE_URL?.trim();
    // Strip potential literal quotes from Vercel env vars
    if (hfSpaceUrl?.startsWith('"') && hfSpaceUrl?.endsWith('"')) {
      hfSpaceUrl = hfSpaceUrl.substring(1, hfSpaceUrl.length - 1);
    }
    
    console.log(`Connecting to Hugging Face Space: "${hfSpaceUrl}"`);
    
    if (!hfSpaceUrl) {
      console.error('HF_SPACE_URL is not configured');
      return NextResponse.json({ error: 'HF_SPACE_URL is not configured' }, { status: 500 });
    }

    // Basic URL validation to prevent "String did not match expected pattern"
    try {
      new URL(hfSpaceUrl);
    } catch (e: any) {
      console.error(`Invalid HF_SPACE_URL pattern: "${hfSpaceUrl}" - Error: ${e.message}`);
      return NextResponse.json({ 
        error: `Invalid HF_SPACE_URL configured: "${hfSpaceUrl}". Ensure it starts with https:// and check for accidental quotes.` 
      }, { status: 500 });
    }

    // Using @gradio/client
    let client;
    try {
      console.log("Attempting Gradio Client.connect...");
      client = await Client.connect(hfSpaceUrl);
      console.log("Gradio Client connected successfully.");
    } catch (error: any) {
      console.error("Gradio Connection Error details:", error);
      return NextResponse.json({ error: `Hugging Face Connection Failed: ${error.message}` }, { status: 500 });
    }

    const result = await client.predict("/predict", { 
        length: length, 
    }) as any;

    const [statusText, pdbData] = result.data || []; 
    
    if (statusText && statusText.includes('failed')) {
        console.error(`Generation failed on space: ${statusText}`);
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
            const blobName = `pdb/generation_${generationRecord?.id || Date.now()}.pdb`;
            const blob = await put(blobName, pdbData, {
                access: 'public',
                contentType: 'text/plain',
            });
            blobUrl = blob.url;
            console.log(`Uploaded to Vercel Blob: ${blobUrl}`);
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
    return NextResponse.json({ 
      success: true, 
      result: [statusText, pdbData],
      blobUrl: blobUrl 
    });

  } catch (error: unknown) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
