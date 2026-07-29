// ===================================================================
// Utilidad para armar el link de consulta por WhatsApp
// ===================================================================
import { db } from "../firebase-config.js";
import { doc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Arma el link wa.me con el mensaje predefinido y registra la consulta.
 * @param {string} numero - número de WhatsApp del negocio (con código de país, solo dígitos)
 * @param {object} producto - producto consultado {codigo, nombre|modelo, id}
 */
export function armarLinkWhatsapp(numero, producto) {
  const nombre = producto.modelo
    ? `${producto.modelo} ${producto.capacidad || ""} ${producto.color || ""}`.trim()
    : producto.nombre || "";
  const mensaje = `Hola, vi el producto ${producto.codigo} (${nombre}) publicado en su catálogo y quisiera más información.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Incrementa el contador de consultas de WhatsApp del producto y el total global */
export async function registrarConsultaWhatsapp(productoId) {
  try {
    await updateDoc(doc(db, "products", productoId), {
      consultasWhatsapp: increment(1),
    });
    await setDoc(doc(db, "stats", "global"), {
      consultasWhatsapp: increment(1),
    }, { merge: true });
  } catch (e) {
    console.warn("No se pudo registrar la consulta de WhatsApp:", e);
  }
}
