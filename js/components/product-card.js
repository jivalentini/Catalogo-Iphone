// ===================================================================
// Renderizado de la tarjeta de producto para el grid del catálogo
// ===================================================================
import { renderEstrellas, renderBateria, renderBadges, formatearPrecio } from "../utils/formato.js";

export function tituloProducto(producto) {
  if (producto.tipo === "iphone") {
    return `iPhone ${producto.modelo} ${producto.capacidad || ""}`.trim();
  }
  return producto.nombre || "Accesorio";
}

export function fotoPrincipal(producto) {
  return (producto.fotos && producto.fotos[0]) || "https://placehold.co/600x600/f5f5f7/6e6e73?text=Sin+foto";
}

export function crearTarjetaProducto(producto) {
  const div = document.createElement("a");
  div.href = `producto.html?id=${producto.id}`;
  div.className = "tarjeta-producto";

  const subinfo = producto.tipo === "iphone"
    ? `${producto.color || ""} · ${renderEstrellas(producto.estadoEstetico)}`
    : `${producto.marca || ""} ${producto.compatibilidad ? "· " + producto.compatibilidad : ""}`;

  div.innerHTML = `
    ${renderBadges(producto)}
    <div class="tarjeta-producto__img">
      <img src="${fotoPrincipal(producto)}" alt="${tituloProducto(producto)}" loading="lazy">
    </div>
    <div class="tarjeta-producto__cuerpo">
      <span class="tarjeta-producto__codigo">${producto.codigo}</span>
      <span class="tarjeta-producto__titulo">${tituloProducto(producto)}</span>
      <span style="font-size:13px;color:var(--color-texto-suave)">${subinfo}</span>
      ${producto.tipo === "iphone" ? renderBateria(producto.bateriaPct) : ""}
      <span class="tarjeta-producto__precio">${formatearPrecio(producto.precio)}</span>
    </div>
  `;
  return div;
}
