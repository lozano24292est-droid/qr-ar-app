"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import QRCodeCard from "@/components/QRCodeCard";

const TIPO_LABEL: Record<Project["tipo_contenido"], string> = {
  video: "Video",
  motion_flyer: "Motion flyer",
  modelo_3d: "Modelo 3D",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects);
    } catch {
      setError("No se pudieron cargar los proyectos");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleEstado(project: Project) {
    const nuevo = project.estado === "activo" ? "inactivo" : "activo";
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo }),
    });
    load();
  }

  async function handleDelete(project: Project) {
    if (!confirm(`¿Eliminar el proyecto "${project.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    load();
  }

  if (error) return <p className="text-red-400">{error}</p>;
  if (!projects) return <p className="text-neutral-400">Cargando...</p>;

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-neutral-400">
        <p className="mb-4">Todavía no hay proyectos QR.</p>
        <Link
          href="/admin/new"
          className="rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-neutral-200"
        >
          Crear el primero
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-white">{project.nombre}</h2>
              <p className="text-xs text-neutral-500">
                {TIPO_LABEL[project.tipo_contenido]} · {project.escaneos} escaneos
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                project.estado === "activo"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-neutral-700 text-neutral-300"
              }`}
            >
              {project.estado}
            </span>
          </div>

          {project.descripcion && (
            <p className="text-sm text-neutral-400">{project.descripcion}</p>
          )}

          <QRCodeCard url={project.url_qr} nombre={project.nombre} />

          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href={`/admin/${project.id}/edit`}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
            >
              Editar
            </Link>
            <a
              href={project.url_qr}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-neutral-800 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
            >
              Ver
            </a>
            <button
              onClick={() => toggleEstado(project)}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
            >
              {project.estado === "activo" ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={() => handleDelete(project)}
              className="rounded-lg bg-red-500/10 px-3 py-1.5 font-medium text-red-400 hover:bg-red-500/20"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
