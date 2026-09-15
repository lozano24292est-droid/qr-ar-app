/**
 * Backend de Google Apps Script para la app QR AR/VR.
 * Desplegar como Web App (Implementar > Nueva implementación > Aplicación web).
 * - Ejecutar como: Yo (tu cuenta)
 * - Quién tiene acceso: Cualquier usuario (necesario para que Next.js pueda llamarlo)
 *
 * La hoja debe llamarse "proyectos" y tener esta fila de encabezado exacta en A1:H1:
 * id | nombre | descripcion | tipo_contenido | url_recurso | url_qr | fecha_creacion | fecha_expiracion | estado | escaneos
 */

const SHEET_NAME = "proyectos";
const UPLOADS_FOLDER_NAME = "QR-AR-VR-uploads";
const SECRET = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");

const COLUMNS = [
  "id",
  "nombre",
  "descripcion",
  "tipo_contenido",
  "url_recurso",
  "url_qr",
  "fecha_creacion",
  "fecha_expiracion",
  "estado",
  "escaneos",
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

function rowToProject_(row) {
  const obj = {};
  COLUMNS.forEach((col, i) => (obj[col] = row[i]));
  obj.escaneos = Number(obj.escaneos || 0);
  obj.fecha_expiracion = obj.fecha_expiracion || null;
  return obj;
}

function listProjects_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  values.shift(); // header
  return values.filter((r) => r[0]).map(rowToProject_);
}

function findRowIndexById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) return i + 1; // 1-indexed row number
  }
  return -1;
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  if (SECRET && body.secret !== SECRET) {
    return jsonResponse_({ error: "No autorizado" });
  }

  try {
    switch (body.action) {
      case "list":
        return jsonResponse_({ projects: listProjects_() });

      case "get": {
        const project = listProjects_().find((p) => p.id === body.id);
        return jsonResponse_({ project: project || null });
      }

      case "create": {
        const sheet = getSheet_();
        const input = body.input;
        const id = (input.id && String(input.id).trim()) || Utilities.getUuid().slice(0, 8);
        const project = {
          id: id,
          nombre: input.nombre,
          descripcion: input.descripcion || "",
          tipo_contenido: input.tipo_contenido,
          url_recurso: input.url_recurso,
          url_qr: body.baseUrl + "/ver/" + id,
          fecha_creacion: new Date().toISOString(),
          fecha_expiracion: input.fecha_expiracion || "",
          estado: input.estado || "activo",
          escaneos: 0,
        };
        sheet.appendRow(COLUMNS.map((c) => project[c]));
        return jsonResponse_({ project: project });
      }

      case "update": {
        const sheet = getSheet_();
        const rowIndex = findRowIndexById_(sheet, body.id);
        if (rowIndex === -1) return jsonResponse_({ project: null });
        const current = rowToProject_(
          sheet.getRange(rowIndex, 1, 1, COLUMNS.length).getValues()[0]
        );
        const updated = Object.assign({}, current, body.input);
        sheet
          .getRange(rowIndex, 1, 1, COLUMNS.length)
          .setValues([COLUMNS.map((c) => (updated[c] === null ? "" : updated[c]))]);
        return jsonResponse_({ project: updated });
      }

      case "remove": {
        const sheet = getSheet_();
        const rowIndex = findRowIndexById_(sheet, body.id);
        if (rowIndex !== -1) sheet.deleteRow(rowIndex);
        return jsonResponse_({ ok: true });
      }

      case "uploadFile": {
        const url = uploadFile_(body.input);
        return jsonResponse_({ url: url });
      }

      case "incrementScan": {
        const sheet = getSheet_();
        const rowIndex = findRowIndexById_(sheet, body.id);
        if (rowIndex !== -1) {
          const cell = sheet.getRange(rowIndex, COLUMNS.indexOf("escaneos") + 1);
          cell.setValue(Number(cell.getValue() || 0) + 1);
        }
        return jsonResponse_({ ok: true });
      }

      default:
        return jsonResponse_({ error: "Acción desconocida: " + body.action });
    }
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

function getUploadsFolder_() {
  const folders = DriveApp.getFoldersByName(UPLOADS_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(UPLOADS_FOLDER_NAME);
}

function uploadFile_(input) {
  const bytes = Utilities.base64Decode(input.dataBase64);
  const blob = Utilities.newBlob(bytes, input.mimeType, input.filename);
  const file = getUploadsFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // Nota: Drive marca sus archivos con Cross-Origin-Resource-Policy: same-site,
  // así que un <video>/fetch() directo desde otro dominio queda bloqueado por el
  // navegador. El enlace /preview usa el reproductor oficial embebido de Drive,
  // que sí es insertable en un <iframe> cross-origin.
  return "https://drive.google.com/file/d/" + file.getId() + "/preview";
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
