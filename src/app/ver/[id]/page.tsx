import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import ContentViewer from "@/components/viewer/ContentViewer";

export const dynamic = "force-dynamic";

export default async function VerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = getStore();
  const project = await store.get(id);

  if (!project) notFound();

  const expirado =
    project.fecha_expiracion !== null &&
    new Date(project.fecha_expiracion).getTime() < Date.now();

  if (project.estado !== "activo" || expirado) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <h1 className="mb-2 text-xl font-semibold">Contenido no disponible</h1>
        <p className="text-neutral-400">
          Este código QR está inactivo o ha expirado.
        </p>
      </main>
    );
  }

  await store.incrementScan(id);

  return <ContentViewer project={project} />;
}
