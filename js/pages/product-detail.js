// ===================================================================
// Lógica de la página de detalle de producto (producto.html)
// ===================================================================
import { db } from "../firebase-config.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { crearGaleria } from "../components/gallery.js";
import { renderEstrellas, renderBateria, formatearPrecio, renderBadges } from "../utils/formato.js";
import { armarLinkWhatsapp, registrarConsultaWhatsapp } from "../utils/whatsapp.js";
import { tituloProducto } from "../components/product-card.js";

function especificacion(titulo, valor) {
  if (valor === undefined || valor === null || valor === "") return "";
  return `<div class="detalle__spec"><b>${titulo}</b>${valor}</div>`;
}

function siNo(valor) { return valor ? "Sí" : "No"; }

export async function iniciarDetalleProducto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const contenedor = document.getElementById("detalleProducto");

  if (!id) {
    contenedor.innerHTML = '<p class="estado-vacio">Producto no especificado.</p>';
    return;
  }

  const configSnap = await getDoc(doc(db, "config", "negocio"));
  const config = configSnap.exists() ? configSnap.data() : {};
  document.documentElement.style.setProperty("--color-primario", config.colorPrimario || "#0071e3");

  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) {
    contenedor.innerHTML = '<p class="estado-vacio">Este producto ya no está disponible.</p>';
    return;
  }
  const producto = { id: snap.id, ...snap.data() };

  document.title = `${tituloProducto(producto)} · ${config.nombre || "Catálogo"}`;

  // Incrementa visitas del producto (una vez por carga de página)
  updateDoc(doc(db, "products", id), { visitas: increment(1) }).catch(() => {});

  let specsHtml = "";
  if (producto.tipo === "iphone") {
    specsHtml = `
      ${especificacion("Modelo", `iPhone ${producto.modelo}`)}
      ${especificacion("Capacidad", producto.capacidad)}
      ${especificacion("Color", producto.color)}
      ${especificacion("Estado", producto.estado === "nuevo" ? "Nuevo" : "Usado")}
      ${especificacion("Estado estético", renderEstrellas(producto.estadoEstetico))}
      ${especificacion("Batería", renderBateria(producto.bateriaPct))}
      ${especificacion("Face ID", siNo(producto.faceId))}
      ${especificacion("True Tone", siNo(producto.trueTone))}
      ${especificacion("Partes originales", siNo(producto.partesOriginales))}
      ${especificacion("Caja", siNo(producto.caja))}
      ${especificacion("Cable", siNo(producto.cable))}
      ${especificacion("Cargador", siNo(producto.cargador))}
      ${especificacion("Auriculares", siNo(producto.auriculares))}
      ${especificacion("Garantía", producto.garantia)}
    `;
  } else {
    specsHtml = `
      ${especificacion("Marca", producto.marca)}
      ${especificacion("Compatibilidad", producto.compatibilidad)}
      ${especificacion("Categoría", producto.categoria)}
      ${especificacion("Stock", producto.stockLogico === "disponible" ? "Disponible" : "Vendido")}
      ${especificacion("Garantía", producto.garantia)}
    `;
  }

  contenedor.innerHTML = `
    <div class="galeria" id="galeria"></div>
    <div class="detalle__info">
      ${renderBadges(producto)}
      <span class="tarjeta-producto__codigo">${producto.codigo}</span>
      <h1>${tituloProducto(producto)}</h1>
      <div class="detalle__precio">${formatearPrecio(producto.precio)}</div>
      <div class="detalle__specs">${specsHtml}</div>
      ${producto.descripcion ? `<div class="detalle__observaciones">${producto.descripcion}</div>` : ""}
      ${producto.observaciones ? `<div class="detalle__observaciones"><b>Observaciones:</b> ${producto.observaciones}</div>` : ""}
      <a class="btn-whatsapp" id="btnWhatsapp" target="_blank" rel="noopener">💬 Consultar por WhatsApp</a>
      <div style="margin-top:16px"><a href="index.html" class="btn-secundario">&larr; Volver al catálogo</a></div>
    </div>
  `;

  crearGaleria({ contenedor: document.getElementById("galeria"), fotos: producto.fotos || [] });

  const numero = (config.whatsapp || "").replace(/\D/g, "");
  const link = armarLinkWhatsapp(numero, producto);
  const btn = document.getElementById("btnWhatsapp");
  btn.href = link;
  btn.addEventListener("click", () => registrarConsultaWhatsapp(id));
}
