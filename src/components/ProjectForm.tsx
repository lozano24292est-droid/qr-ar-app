"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, TipoContenido } from "@/lib/types";

type FormState = {
  nombre: string;
  descripcion: string;
  tipo_contenido: TipoContenido;
  url_recurso: string;
  fecha_expiracion: string;
  estado: "activo" | "inactivo";
};

const TIPOS: {
  value: TipoContenido;
  label: string;
  hint: string;
  accept: string;
}[] = [
  {
    value: "video",
    label: "Video en movimiento",
    hint: "Sube un .mp4/.webm/.mov, o pega una URL externa (Drive, YouTube, etc.)",
    accept: ".mp4,.webm,.mov",
  },
  {
    value: "motion_flyer",
    label: "Motion flyer (After Effects)",
    hint: "Sube un .json exportado con Bodymovin/Lottie, o un .webm con canal alpha",
    accept: ".json,.webm",
  },
  {
    value: "modelo_3d",
    label: "Modelo 3D",
    hint: "Sube un archivo .glb o .gltf exportado desde tu software 3D",
    accept: ".glb,.gltf",
  },
];

export default function ProjectForm({
  initial,
  projectId,
}: {
  initial?: Project;
  projectId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nombre: initial?.nombre ?? "",
    descripcion: initial?.descripcion ?? "",
    tipo_contenido: initial?.tipo_contenido ?? "video",
    url_recurso: initial?.url_recurso ?? "",
    fecha_expiracion: initial?.fecha_expiracion?.slice(0, 10) ?? "",
    estado: initial?.estado ?? "activo",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"upload" | "url">(
    initial?.url_recurso ? "url" : "upload"
  );
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir el archivo");
        return;
      }
      update("url_recurso", data.url);
      setUploadedName(file.name);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        fecha_expiracion: form.fecha_expiracion || null,
      };
      const res = await fetch(
        projectId ? `/api/projects/${projectId}` : "/api/projects",
        {
          method: projectId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar el proyecto");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-xl flex-col gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
    >
      <div>
        <label className="mb-1 block text-sm text-neutral-300">Nombre</label>
        <input
          required
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-neutral-500"
          placeholder="Flyer lanzamiento producto X"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-300">
          Descripción
        </label>
        <textarea
          value={form.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-neutral-300">
          Tipo de contenido
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TIPOS.map((tipo) => (
            <button
              type="button"
              key={tipo.value}
              onClick={() => update("tipo_contenido", tipo.value)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                form.tipo_contenido === tipo.value
                  ? "border-white bg-white/10 text-white"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-neutral-300">Recurso multimedia</label>
          <div className="flex rounded-lg border border-neutral-700 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSource("upload")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                source === "upload"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setSource("url")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                source === "url"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              URL externa
            </button>
          </div>
        </div>

        {source === "upload" ? (
          <div>
            <input
              type="file"
              accept={TIPOS.find((t) => t.value === form.tipo_contenido)?.accept}
              onChange={handleFileChange}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none file:mr-3 file:rounded-md file:border-0 file:bg-neutral-700 file:px-3 file:py-1.5 file:text-white hover:file:bg-neutral-600"
            />
            {uploading && (
              <p className="mt-2 text-xs text-neutral-400">Subiendo archivo...</p>
            )}
            {!uploading && form.url_recurso && (
              <p className="mt-2 truncate text-xs text-emerald-400">
                ✓ {uploadedName ?? form.url_recurso}
              </p>
            )}
          </div>
        ) : (
          <input
            required
            value={form.url_recurso}
            onChange={(e) => update("url_recurso", e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-neutral-500"
            placeholder="https://..."
          />
        )}
        <p className="mt-2 text-xs text-neutral-500">
          {TIPOS.find((t) => t.value === form.tipo_contenido)?.hint}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Fecha de expiración (opcional)
          </label>
          <input
            type="date"
            value={form.fecha_expiracion}
            onChange={(e) => update("fecha_expiracion", e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Estado</label>
          <select
            value={form.estado}
            onChange={(e) =>
              update("estado", e.target.value as "activo" | "inactivo")
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-neutral-500"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-white py-2.5 font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
      >
        {saving ? "Guardando..." : projectId ? "Guardar cambios" : "Crear proyecto QR"}
      </button>
    </form>
  );
}
