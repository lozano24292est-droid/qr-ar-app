"use client";

import { useEffect, useRef } from "react";

export default function MotionFlyerViewer({ src }: { src: string }) {
  const isLottie = src.toLowerCase().endsWith(".json");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLottie || !containerRef.current) return;
    let anim: { destroy: () => void } | null = null;
    import("lottie-web").then((lottie) => {
      if (!containerRef.current) return;
      anim = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: src,
      });
    });
    return () => anim?.destroy();
  }, [isLottie, src]);

  if (isLottie) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-contain"
      />
    </div>
  );
}
