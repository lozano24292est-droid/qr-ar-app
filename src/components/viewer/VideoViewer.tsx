"use client";

export default function VideoViewer({ src }: { src: string }) {
  const driveMatch = src.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (driveMatch) {
    const fileId = driveMatch[1];
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          allow="autoplay"
          className="h-full w-full border-0"
        />
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
        controls
        className="h-full w-full object-contain"
      />
    </div>
  );
}
