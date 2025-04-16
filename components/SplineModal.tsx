'use client';

import { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

interface SplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SplineModal({ isOpen, onClose }: SplineModalProps) {
  if (!isOpen) return null;
  
  const handleSplineLoad = (spline: Application) => {
    // Access the camera and adjust zoom level
    const camera = spline.camera;
    if (camera) {
      // Adjust zoom level - higher value zooms out
      camera.zoom = 1;
      // You can also adjust the position if needed
      // camera.position.z = 1000;
      spline.setZoom(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/8eGJMv5jCy8gnKtI/scene.splinecode"
          className="w-full h-full"
          onLoad={handleSplineLoad}
        />
      </div>
      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
      >
        <span className='text-black font-semibold'>Enter</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="black"
        >
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
} 