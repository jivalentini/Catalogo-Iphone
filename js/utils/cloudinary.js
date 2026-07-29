// ===================================================================
// Subida de imágenes a Cloudinary (reemplaza a Firebase Storage, que
// desde febrero de 2026 exige tener el plan de pago Blaze activado).
// Cloudinary tiene un nivel gratuito permanente (25GB de almacenamiento
// y 25GB de transferencia por mes) sin pedir tarjeta.
//
// Configurá estos dos valores con los datos de tu cuenta de Cloudinary
// (ver README, sección "Configuración de Cloudinary").
// ===================================================================

export const CLOUDINARY_CLOUD_NAME = "gbokvmbb";
export const CLOUDINARY_UPLOAD_PRESET = "catalogo-iphone";

/**
 * Sube un archivo de imagen a Cloudinary usando un "upload preset" sin
 * firma (pensado para apps sin backend) y devuelve la URL pública.
 * @param {File} archivo
 * @param {string} carpeta - carpeta lógica dentro de Cloudinary (ej: "productos/IP-000021")
 */
export async function subirImagenCloudinary(archivo, carpeta = "productos") {
  if (CLOUDINARY_CLOUD_NAME === "TU_CLOUD_NAME") {
    throw new Error("Falta configurar Cloudinary en js/utils/cloudinary.js (ver README).");
  }

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", carpeta);

  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    throw new Error(`No se pudo subir la imagen a Cloudinary. ${detalle}`);
  }

  const datos = await respuesta.json();
  return datos.secure_url;
}

/**
 * Sube varias imágenes en secuencia y devuelve el array de URLs.
 * @param {File[]} archivos
 * @param {string} carpeta
 */
export async function subirVariasImagenesCloudinary(archivos, carpeta = "productos") {
  const urls = [];
  for (const archivo of archivos) {
    urls.push(await subirImagenCloudinary(archivo, carpeta));
  }
  return urls;
}

// Nota: la eliminación de imágenes en Cloudinary requiere una petición
// firmada (con API secret), que no puede hacerse de forma segura desde
// el navegador sin backend. Por eso, al eliminar un producto solo se
// borra el documento de Firestore; la imagen queda huérfana en
// Cloudinary. Con el nivel gratuito (25GB) esto no suele ser un
// problema, pero si querés limpiarlas podés hacerlo manualmente desde
// el panel de Cloudinary (Media Library) de tanto en tanto.
