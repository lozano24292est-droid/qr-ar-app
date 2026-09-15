import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Project, ProjectInput } from "./types";

export interface DataStore {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | null>;
  create(input: ProjectInput, baseUrl: string): Promise<Project>;
  update(id: string, input: Partial<ProjectInput>): Promise<Project | null>;
  remove(id: string): Promise<void>;
  incrementScan(id: string): Promise<void>;
}

const DATA_FILE = path.join(process.cwd(), "data", "projects.json");

async function readLocal(): Promise<Project[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

async function writeLocal(projects: Project[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

class LocalJsonStore implements DataStore {
  async list(): Promise<Project[]> {
    return readLocal();
  }

  async get(id: string): Promise<Project | null> {
    const projects = await readLocal();
    return projects.find((p) => p.id === id) ?? null;
  }

  async create(input: ProjectInput, baseUrl: string): Promise<Project> {
    const projects = await readLocal();
    const id = input.id?.trim() || randomUUID().slice(0, 8);
    const project: Project = {
      id,
      nombre: input.nombre,
      descripcion: input.descripcion,
      tipo_contenido: input.tipo_contenido,
      url_recurso: input.url_recurso,
      url_qr: `${baseUrl}/ver/${id}`,
      fecha_creacion: new Date().toISOString(),
      fecha_expiracion: input.fecha_expiracion ?? null,
      estado: input.estado ?? "activo",
      escaneos: 0,
    };
    projects.push(project);
    await writeLocal(projects);
    return project;
  }

  async update(
    id: string,
    input: Partial<ProjectInput>
  ): Promise<Project | null> {
    const projects = await readLocal();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], ...input };
    await writeLocal(projects);
    return projects[idx];
  }

  async remove(id: string): Promise<void> {
    const projects = await readLocal();
    await writeLocal(projects.filter((p) => p.id !== id));
  }

  async incrementScan(id: string): Promise<void> {
    const projects = await readLocal();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return;
    projects[idx].escaneos += 1;
    await writeLocal(projects);
  }
}

class SheetsStore implements DataStore {
  constructor(private readonly scriptUrl: string, private readonly secret: string) {}

  private async call(action: string, payload: Record<string, unknown> = {}) {
    const res = await fetch(this.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, secret: this.secret, ...payload }),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Apps Script error (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  async list(): Promise<Project[]> {
    const data = await this.call("list");
    return data.projects as Project[];
  }

  async get(id: string): Promise<Project | null> {
    const data = await this.call("get", { id });
    return (data.project as Project) ?? null;
  }

  async create(input: ProjectInput, baseUrl: string): Promise<Project> {
    const data = await this.call("create", { input, baseUrl });
    return data.project as Project;
  }

  async update(
    id: string,
    input: Partial<ProjectInput>
  ): Promise<Project | null> {
    const data = await this.call("update", { id, input });
    return (data.project as Project) ?? null;
  }

  async remove(id: string): Promise<void> {
    await this.call("remove", { id });
  }

  async incrementScan(id: string): Promise<void> {
    await this.call("incrementScan", { id });
  }
}

let store: DataStore | null = null;

export function getStore(): DataStore {
  if (store) return store;
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.GOOGLE_SCRIPT_SECRET;
  if (scriptUrl && secret) {
    store = new SheetsStore(scriptUrl, secret);
  } else {
    store = new LocalJsonStore();
  }
  return store;
}
