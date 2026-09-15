"use client";

import { useEffect, useState } from "react";

export default function Model3DViewer({
  src,
  nombre,
}: {
  src: string;
  nombre: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true));
  }, []);

  return (
    <div className="relative h-full w-full">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          Cargando visor 3D...
        </div>
      )}
      {ready && (
        <model-viewer
          src={src}
          alt={nombre}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          reveal="auto"
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
        >
          <button
            slot="ar-button"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-lg"
          >
            Ver en tu espacio (AR)
          </button>
        </model-viewer>
      )}
    </div>
  );
}
