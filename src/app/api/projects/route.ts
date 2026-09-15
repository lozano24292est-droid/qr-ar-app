import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import type { ProjectInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const projects = await getStore().list();
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const input = (await req.json()) as ProjectInput;

  if (!input.nombre || !input.tipo_contenido || !input.url_recurso) {
    return NextResponse.json(
      { error: "nombre, tipo_contenido y url_recurso son obligatorios" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.APP_BASE_URL ?? req.nextUrl.origin;
  const project = await getStore().create(input, baseUrl);
  return NextResponse.json({ project }, { status: 201 });
}
