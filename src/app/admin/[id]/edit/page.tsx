import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import ProjectForm from "@/components/ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getStore().get(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-white">
        Editar: {project.nombre}
      </h1>
      <ProjectForm initial={project} projectId={project.id} />
    </div>
  );
}
