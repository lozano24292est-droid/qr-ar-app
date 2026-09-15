"use client";

import type { Project } from "@/lib/types";
import VideoViewer from "./VideoViewer";
import MotionFlyerViewer from "./MotionFlyerViewer";
import Model3DViewer from "./Model3DViewer";

export default function ContentViewer({ project }: { project: Project }) {
  return (
    <div className="fixed inset-0 bg-black">
      {project.tipo_contenido === "video" && (
        <VideoViewer src={project.url_recurso} />
      )}
      {project.tipo_contenido === "motion_flyer" && (
        <MotionFlyerViewer src={project.url_recurso} />
      )}
      {project.tipo_contenido === "modelo_3d" && (
        <Model3DViewer src={project.url_recurso} nombre={project.nombre} />
      )}
      <div className="pointer-events-none absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
        <p className="text-sm font-medium text-white">{project.nombre}</p>
      </div>
    </div>
  );
}
