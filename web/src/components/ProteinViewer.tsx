'use client';

import { useEffect, useRef } from 'react';

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
    const loadScript = () => {
      if (!window.$3Dmol) {
        const script = document.createElement('script');
        script.src = 'https://3dmol.org/build/3Dmol-min.js';
        script.async = true;

        script.onload = () => {
          initViewer();
        };

        document.body.appendChild(script);
      } else {
        initViewer();
      }
    };

    const initViewer = () => {
      if (!viewerRef.current || !window.$3Dmol) return;

      if (!viewerInstance.current) {
        viewerInstance.current = window.$3Dmol.createViewer(
          viewerRef.current,
          {
            backgroundColor: 'black',
          }
        );
      }

      const viewer = viewerInstance.current;

      setTimeout(() => {
        viewer.clear();

        viewer.addModel(pdbData, 'pdb');

        viewer.setStyle({}, {
          cartoon: {
            color: 'spectrum',
          },
        });

        viewer.zoomTo();

        viewer.render();
        viewer.resize();

      }, 100);
    };

    loadScript();
  }, [pdbData]);

  return (
    <div
      ref={viewerRef}
      style={{
        width: '100%',
        height: '500px',
        position: 'relative',
      }}
    />
  );
}