import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isDriveUploadConfigured, uploadFileToDrive } from "@/lib/store";

const ALLOWED_EXTENSIONS = ["mp4", "webm", "mov", "json", "glb", "gltf"];
const MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  json: "application/json",
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
};
// Apps Script doPost bodies are capped around 50MB; base64 adds ~37% overhead.
const MAX_BYTES_DRIVE = 25 * 1024 * 1024; // 25MB
const MAX_BYTES_LOCAL = 200 * 1024 * 1024; // 200MB (dev only)

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      {
        error: `Extensión .${ext} no permitida. Usa: ${ALLOWED_EXTENSIONS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const useDrive = isDriveUploadConfigured();
  const maxBytes = useDrive ? MAX_BYTES_DRIVE : MAX_BYTES_LOCAL;

  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: `El archivo supera el límite de ${Math.round(maxBytes / 1024 / 1024)}MB`,
      },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (useDrive) {
    const url = await uploadFileToDrive(
      filename,
      MIME_TYPES[ext] ?? "application/octet-stream",
      buffer.toString("base64")
    );
    return NextResponse.json({ url });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
