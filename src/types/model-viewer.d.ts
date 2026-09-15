import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerJSX = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "shadow-intensity"?: string;
  exposure?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerJSX;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": ModelViewerJSX;
      }
    }
  }
}

export {};
