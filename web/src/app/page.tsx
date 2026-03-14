'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const ProteinViewer = dynamic(() => import('@/components/ProteinViewer'), {
  ssr: false, // 3dmol.js needs window to be defined
});

export default function Home() {
  const [length, setLength] = useState<number>(150);
  const [status, setStatus] = useState<string>('');
  const [pdbData, setPdbData] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('Initializing generation...');
    setPdbData(null);
    setBlobUrl(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setStatus(`Error: ${data.error || 'Failed to generate'}`);
      } else {
        // data.result should be [statusText, pdbDataString]
        const [hfStatus, hfPdbData] = data.result || [];
        setStatus(hfStatus || 'Completed successfully!');
        if (hfPdbData) {
          setPdbData(hfPdbData);
        }
        if (data.blobUrl) {
          setBlobUrl(data.blobUrl);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setStatus(`Error connecting to server... \n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-8 sm:p-20 font-sans">
      <main className="w-full max-w-4xl flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text">
            Wonderer Protein Generator
          </h1>
          <p className="text-neutral-400 text-lg">
            Powered by RFdiffusion and Hugging Face. Set a length and generate custom protein structures instantly.
          </p>
        </header>

        <section className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-6 items-end">
            <div className="flex-1 w-full flex flex-col gap-3">
              <label htmlFor="length" className="text-sm font-medium text-neutral-300">
                Protein Length
              </label>
              <input
                id="length"
                type="number"
                min="10"
                max="1000"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
            
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Protein'}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-sm font-mono text-cyan-400 flex justify-between items-center">
             <span>Status: {status || 'Idle'}</span>
             {blobUrl && (
               <a 
                 href={blobUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-emerald-400 hover:text-emerald-300 underline"
               >
                 Download PDB
               </a>
             )}
          </div>
        </section>

        {pdbData && (
           <section className="relative w-full rounded-3xl overflow-hidden border border-neutral-800 shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)] bg-neutral-900 flex justify-center items-center min-h-[500px]">
             <ProteinViewer pdbData={pdbData} />
           </section>
        )}
      </main>
    </div>

  );
}
