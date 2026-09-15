export type TipoContenido = "video" | "motion_flyer" | "modelo_3d";
export type EstadoProyecto = "activo" | "inactivo";

export interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  tipo_contenido: TipoContenido;
  url_recurso: string;
  url_qr: string;
  fecha_creacion: string;
  fecha_expiracion: string | null;
  estado: EstadoProyecto;
  escaneos: number;
}

export type ProjectInput = Omit<
  Project,
  "id" | "url_qr" | "fecha_creacion" | "escaneos"
> & { id?: string };
