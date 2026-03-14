'use client';

import { useEffect, useRef } from 'react';

// We need to extend the Window interface to include $3Dmol that is loaded via script tag
declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface ViewerProps {
  pdbData: string;
}

export default function ProteinViewer({ pdbData }: ViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    // Check if the script is loaded
    if (typeof window !== 'undefined' && !window.$3Dmol) {
        const script = document.createElement('script');
        script.src = 'https://3dmol.org/build/3Dmol-min.js';
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = initViewer;
    } else {
        initViewer();
    }

    function initViewer() {
      if (viewerRef.current && window.$3Dmol) {
        // Only create viewer once
        if (!viewerInstance.current) {
            viewerInstance.current = window.$3Dmol.createViewer(viewerRef.current, {
            backgroundColor: 'black',
            });
        }
        
        const viewer = viewerInstance.current;
        viewer.clear();
        viewer.addModel(pdbData, 'pdb');
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.zoomTo();
        viewer.render();
      }
    }

  }, [pdbData]);

  return (
    <div 
        ref={viewerRef} 
        className="relative w-full h-[500px] rounded-2xl overflow-hidden" 
    />
  );
}
