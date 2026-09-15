"use client";

export default function VideoViewer({ src }: { src: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        controls
        className="h-full w-full object-contain"
      />
    </div>
  );
}
