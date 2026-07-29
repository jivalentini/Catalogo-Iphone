// ===================================================================
// Utilidades de formato: código automático, estrellas, batería, precio
// ===================================================================
import { db } from "../firebase-config.js";
import {
  doc, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Genera un código automático correlativo y atómico (IP-000001 / ACC-000001)
 * usando una transacción sobre config/contadores para evitar duplicados.
 * @param {"iphone"|"accesorio"} tipo
 */
export async function generarCodigo(tipo) {
  const prefijo = tipo === "iphone" ? "IP" : "ACC";
  const campo = tipo === "iphone" ? "iphone" : "accesorio";
  const ref = doc(db, "config", "contadores");

  const siguiente = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const datos = snap.exists() ? snap.data() : {};
    const actual = (datos[campo] || 0) + 1;
    tx.set(ref, { ...datos, [campo]: actual }, { merge: true });
    return actual;
  });

  return `${prefijo}-${String(siguiente).padStart(6, "0")}`;
}

/** Devuelve HTML de estrellas (1 a 5) para el estado estético */
export function renderEstrellas(cantidad = 0) {
  let html = '<span class="estrellas">';
  for (let i = 1; i <= 5; i++) {
    html += i <= cantidad ? "★" : '<span class="apagada">★</span>';
  }
  html += "</span>";
  return html;
}

/** Devuelve HTML de la barra visual de batería según el porcentaje */
export function renderBateria(pct) {
  if (pct === undefined || pct === null) return "";
  const color = pct >= 85 ? "var(--color-exito)" : pct >= 60 ? "var(--color-advertencia)" : "var(--color-error)";
  return `
    <div class="barra-bateria">
      <div class="barra-bateria__pista">
        <div class="barra-bateria__relleno" style="width:${pct}%;background:${color}"></div>
      </div>
      <span>${pct}%</span>
    </div>`;
}

/** Formatea un número como precio en pesos */
export function formatearPrecio(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

/** Genera el HTML de los badges/etiquetas de un producto */
export function renderBadges(producto) {
  const etiquetas = producto.etiquetas || [];
  const mapaClases = {
    "Oferta": "oferta",
    "Destacado": "destacado",
    "Nuevo ingreso": "nuevo-ingreso",
  };
  let html = '<div class="badges">';
  if (producto.stockLogico === "vendido" || producto.vendido) {
    html += `<span class="badge vendido">Vendido</span>`;
  }
  etiquetas.forEach((et) => {
    html += `<span class="badge ${mapaClases[et] || ""}">${et}</span>`;
  });
  html += "</div>";
  return html;
}

/** Debounce simple para el buscador predictivo */
export function debounce(fn, espera = 250) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}
