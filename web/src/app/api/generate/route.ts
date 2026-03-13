import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { length } = await req.json();

    if (!length || typeof length !== 'number') {
      return NextResponse.json({ error: 'Invalid protein length' }, { status: 400 });
    }

    // Attempt to save request to database with PENDING status
    let generationRecord;
    try {
      generationRecord = await prisma.generation.create({
        data: {
          length,
          status: 'PENDING',
        },
      });
    } catch {
      console.warn("Database connection might be unavailable. Proceeding without DB.");
    }

    // Call Hugging Face API (assumes the model is hosted there via Gradio Spaces)
    const hfSpaceUrl = process.env.HF_SPACE_URL;
    if (!hfSpaceUrl) {
      return NextResponse.json({ error: 'HF_SPACE_URL is not configured' }, { status: 500 });
    }

    const response = await fetch(`${hfSpaceUrl}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [length],
      }),
    });

    if (!response.ok) {
        if(generationRecord) {
            await prisma.generation.update({
                where: { id: generationRecord.id },
                data: { status: 'FAILED' }
            });
        }
      throw new Error(`Hugging Face API returned error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Result typically contains [statusText, viewerHtml] based on the Gradio app.py
    const outputData = result.data; 

    if(generationRecord) {
        await prisma.generation.update({
            where: { id: generationRecord.id },
            data: { status: 'SUCCESS' }
        });
    }

    return NextResponse.json({ success: true, result: outputData });

  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
