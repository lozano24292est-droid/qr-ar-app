"use client";

import { useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

export default function QRCodeCard({
  url,
  nombre,
}: {
  url: string;
  nombre: string;
}) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  function downloadPng() {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${nombre}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadSvg() {
    const svg = svgWrapperRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `qr-${nombre}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div ref={canvasWrapperRef}>
        <QRCodeCanvas value={url} size={160} includeMargin level="M" />
      </div>
      <div ref={svgWrapperRef} className="hidden">
        <QRCodeSVG value={url} size={512} includeMargin level="M" />
      </div>
      <p className="max-w-[180px] truncate text-xs text-neutral-400" title={url}>
        {url}
      </p>
      <div className="flex gap-2">
        <button
          onClick={downloadPng}
          className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
        >
          PNG
        </button>
        <button
          onClick={downloadSvg}
          className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
        >
          SVG
        </button>
      </div>
    </div>
  );
}
