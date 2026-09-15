# QR AR/VR

Genera códigos QR dinámicos gestionados desde Google Sheets. Al escanearlos, se abre en el navegador móvil una experiencia de video, motion flyer o modelo 3D en AR — sin instalar ninguna app.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- `qrcode.react` para generar los QR (descarga PNG/SVG)
- `<model-viewer>` de Google para modelos 3D (WebXR / Scene Viewer / Quick Look)
- `lottie-web` para motion flyers exportados como Lottie/Bodymovin; también soporta video con alpha (WebM)
- Capa de datos intercambiable: Google Apps Script (producción, usa Google Sheets como DB) o un JSON local (`data/projects.json`) para desarrollo sin credenciales

## 1. Desarrollo local (sin Google Sheets)

```bash
npm install
cp .env.local.example .env.local
```

Edita `.env.local` y define al menos:

```
ADMIN_PASSWORD=una-contraseña
SESSION_SECRET=una-cadena-larga-aleatoria
```

Deja `GOOGLE_SCRIPT_URL` y `GOOGLE_SCRIPT_SECRET` vacíos: la app usará automáticamente `data/projects.json` como base de datos local.

```bash
npm run dev
```

Abre `http://localhost:3000/admin`, inicia sesión con `ADMIN_PASSWORD` y crea tu primer proyecto QR.

## 2. Conectar tu propia Google Sheet (producción)

1. Crea una Google Sheet nueva (puede estar vacía; el script crea la hoja `proyectos` automáticamente).
2. Abre **Extensiones > Apps Script** y pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
3. En el editor de Apps Script ve a **Configuración del proyecto > Propiedades del script** y agrega:
   - `SHARED_SECRET`: una cadena secreta cualquiera (debe coincidir con `GOOGLE_SCRIPT_SECRET` en tu `.env.local`).
4. **Implementar > Nueva implementación > Aplicación web**:
   - Ejecutar como: tu cuenta
   - Quién tiene acceso: **Cualquier usuario**
5. Copia la URL de la implementación (termina en `/exec`) y en `.env.local`:

```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
GOOGLE_SCRIPT_SECRET=el-mismo-secreto-del-paso-3
APP_BASE_URL=https://tu-dominio.com
```

### Columnas requeridas en la hoja `proyectos`

| id | nombre | descripcion | tipo_contenido | url_recurso | url_qr | fecha_creacion | fecha_expiracion | estado | escaneos |
|----|--------|-------------|-----------------|-------------|--------|-----------------|-------------------|--------|----------|

`tipo_contenido` acepta: `video`, `motion_flyer`, `modelo_3d`. `estado` acepta: `activo`, `inactivo`. La hoja se crea sola con este encabezado la primera vez que el script se ejecuta; no la edites manualmente salvo para corregir datos.

## 3. Tipos de contenido: subir archivo o pegar URL

En "Nuevo proyecto QR" hay un selector **Subir archivo / URL externa**:

- **Subir archivo**: sube el archivo directamente desde el panel. Extensiones permitidas por tipo:
  - **video**: `.mp4`, `.webm`, `.mov`
  - **motion_flyer**: `.json` (Lottie/Bodymovin exportado desde After Effects) o `.webm` con canal alpha
  - **modelo_3d**: `.glb`, `.gltf`
- **URL externa**: pega un enlace ya alojado en otro lado (YouTube, Firebase Storage, Cloudinary, un Drive link directo, etc.).

**¿Dónde se guarda "Subir archivo"?**

- Si `GOOGLE_SCRIPT_URL`/`GOOGLE_SCRIPT_SECRET` están configurados (producción con Sheets): el archivo se envía al Apps Script ([`apps-script/Code.gs`](apps-script/Code.gs)) y se guarda en una carpeta de **tu Google Drive** llamada `QR-AR-VR-uploads`, con el enlace puesto en "cualquiera con el enlace puede ver". Esto es persistente — sobrevive redeploys y reinicios. Límite: **25MB** por archivo (limitación del tamaño de petición de Apps Script).
- Si no hay Sheets configurado (desarrollo local): se guarda en `public/uploads/` del servidor. Límite: 200MB. **No uses este modo en producción** — en cualquier hosting con filesystem efímero (Render free, Vercel, Netlify, Railway sin volumen) los archivos se pierden en el próximo reinicio o redeploy, incluso minutos después de subirlos.

> Nota: al agregar la subida a Drive, el Apps Script pide permiso adicional (acceso a Drive) la primera vez — tendrás que volver a autorizarlo desde **Implementar > Gestionar implementaciones** o creando una nueva implementación.

## 4. Despliegue

Cualquier hosting compatible con Next.js funciona (Render, Railway, Vercel, Netlify, VPS propio) — **con `GOOGLE_SCRIPT_URL`/`GOOGLE_SCRIPT_SECRET` configurados, "Subir archivo" ya no depende del filesystem del servidor** (va a Google Drive), así que el filesystem efímero de los hosts *serverless* deja de ser un problema para esa función.

- **Render** o **Railway**: conecta el repo de GitHub, comando de build `npm run build`, comando de start `npm start`, agrega las variables de `.env.local` en su panel.
- **VPS propio**: `npm run build && npm start` detrás de un proxy (Nginx/Caddy) con PM2 o systemd.

Configura las mismas variables de entorno de `.env.local` en el panel del proveedor. `APP_BASE_URL` debe ser el dominio final, ya que se usa para construir la URL que codifica cada QR.

```bash
npm run build
npm start
```

## 5. Flujo de uso

1. Entra a `/admin`, inicia sesión.
2. "+ Nuevo QR" → define nombre, tipo de contenido y la URL del recurso.
3. Se guarda en Sheets/local y se genera el QR (apunta a `/ver/{id}`, no al recurso directo — así puedes cambiar el contenido sin reimprimir el QR).
4. Descarga el QR en PNG o SVG desde la tarjeta del proyecto.
5. Al escanearlo, `/ver/{id}` consulta el tipo de contenido y renderiza el visor correspondiente, incrementando el contador de escaneos.

## Estructura del proyecto

```
src/
  app/
    admin/          Panel de administración (protegido por proxy.ts)
    api/             Rutas API: auth, projects CRUD, scan
    ver/[id]/        Visor público AR/VR
  components/
    viewer/          VideoViewer, MotionFlyerViewer, Model3DViewer
  lib/
    store.ts         Capa de datos (LocalJsonStore | SheetsStore)
    auth.ts          Sesión de admin (cookie firmada)
apps-script/
  Code.gs            Backend de Google Apps Script (Sheets como API REST)
```


