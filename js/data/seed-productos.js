// ===================================================================
// Datos iniciales de ejemplo: 20 iPhone (11 a 16 Pro Max) + 10 accesorios
// Se usan una sola vez desde seed.html para poblar Firestore.
// Las fotos son placeholders (placehold.co) — reemplazalas por fotos
// reales desde el panel una vez cargado el producto.
// ===================================================================

function fotosPlaceholder(texto, cantidad = 3) {
  const colores = ["1d1d1f/ffffff", "0071e3/ffffff", "f5f5f7/1d1d1f"];
  return Array.from({ length: cantidad }, (_, i) =>
    `https://placehold.co/700x700/${colores[i % colores.length]}?text=${encodeURIComponent(texto + " " + (i + 1))}`
  );
}

export const IPHONES_SEED = [
  { modelo: "11", capacidad: "64GB", color: "Negro", precio: 380000, estado: "usado", estadoEstetico: 4, bateriaPct: 87, etiquetas: ["Batería excelente"] },
  { modelo: "11 Pro", capacidad: "256GB", color: "Verde noche", precio: 480000, estado: "usado", estadoEstetico: 4, bateriaPct: 84, etiquetas: [] },
  { modelo: "11 Pro Max", capacidad: "256GB", color: "Gris espacial", precio: 540000, estado: "usado", estadoEstetico: 5, bateriaPct: 91, etiquetas: ["Como nuevo"] },
  { modelo: "12", capacidad: "128GB", color: "Blanco", precio: 520000, estado: "usado", estadoEstetico: 4, bateriaPct: 86, etiquetas: [] },
  { modelo: "12 mini", capacidad: "64GB", color: "Azul", precio: 460000, estado: "usado", estadoEstetico: 3, bateriaPct: 79, etiquetas: ["Oferta"] },
  { modelo: "12 Pro", capacidad: "256GB", color: "Grafito", precio: 620000, estado: "usado", estadoEstetico: 4, bateriaPct: 88, etiquetas: [] },
  { modelo: "12 Pro Max", capacidad: "512GB", color: "Oro", precio: 720000, estado: "usado", estadoEstetico: 5, bateriaPct: 93, etiquetas: ["Destacado"] },
  { modelo: "13", capacidad: "128GB", color: "Rosa", precio: 640000, estado: "usado", estadoEstetico: 5, bateriaPct: 90, etiquetas: ["Como nuevo"] },
  { modelo: "13 mini", capacidad: "256GB", color: "Medianoche", precio: 610000, estado: "usado", estadoEstetico: 4, bateriaPct: 85, etiquetas: [] },
  { modelo: "13 Pro", capacidad: "256GB", color: "Azul alpino", precio: 780000, estado: "usado", estadoEstetico: 4, bateriaPct: 89, etiquetas: ["Oferta"] },
  { modelo: "13 Pro Max", capacidad: "512GB", color: "Verde alpino", precio: 860000, estado: "usado", estadoEstetico: 5, bateriaPct: 92, etiquetas: ["Destacado"] },
  { modelo: "14", capacidad: "128GB", color: "Amarillo", precio: 820000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: ["Nuevo ingreso"] },
  { modelo: "14 Plus", capacidad: "256GB", color: "Púrpura", precio: 900000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: ["Nuevo ingreso"] },
  { modelo: "14 Pro", capacidad: "256GB", color: "Morado oscuro", precio: 1050000, estado: "usado", estadoEstetico: 5, bateriaPct: 94, etiquetas: ["Como nuevo"] },
  { modelo: "14 Pro Max", capacidad: "512GB", color: "Negro espacial", precio: 1180000, estado: "usado", estadoEstetico: 5, bateriaPct: 95, etiquetas: ["Destacado"] },
  { modelo: "15", capacidad: "128GB", color: "Verde", precio: 1050000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: ["Nuevo ingreso"] },
  { modelo: "15 Plus", capacidad: "256GB", color: "Azul", precio: 1180000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: [] },
  { modelo: "15 Pro", capacidad: "256GB", color: "Titanio natural", precio: 1350000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: ["Destacado"] },
  { modelo: "15 Pro Max", capacidad: "512GB", color: "Titanio negro", precio: 1550000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: ["Destacado", "Oferta"] },
  { modelo: "16 Pro Max", capacidad: "1TB", color: "Titanio del desierto", precio: 1980000, estado: "nuevo", estadoEstetico: 5, bateriaPct: 100, etiquetas: ["Nuevo ingreso", "Destacado"] },
].map((p, i) => ({
  tipo: "iphone",
  categoria: "iPhone",
  faceId: true,
  trueTone: true,
  partesOriginales: true,
  caja: p.estado === "nuevo" ? true : i % 2 === 0,
  cable: true,
  cargador: p.estado === "nuevo" ? true : i % 3 !== 0,
  auriculares: i % 4 === 0,
  garantia: p.estado === "nuevo" ? "12 meses" : "3 meses",
  observaciones: p.estado === "nuevo" ? "Producto 0km, sellado de fábrica." : "Excelente estado general, revisado y garantizado.",
  fotos: fotosPlaceholder(`iPhone ${p.modelo}`),
  destacado: p.etiquetas.includes("Destacado"),
  stockLogico: "disponible",
  vendido: false,
  visitas: 0,
  consultasWhatsapp: 0,
  ...p,
}));

export const ACCESORIOS_SEED = [
  { nombre: "AirPods Pro (2ª generación)", marca: "Apple", compatibilidad: "iPhone / iPad", categoria: "AirPods", descripcion: "Cancelación activa de ruido, estuche con MagSafe.", precio: 320000 },
  { nombre: "AirPods 3ª generación", marca: "Apple", compatibilidad: "iPhone / iPad", categoria: "AirPods", descripcion: "Audio espacial, resistentes al agua.", precio: 220000 },
  { nombre: "Cargador MagSafe", marca: "Apple", compatibilidad: "iPhone 12 en adelante", categoria: "Cargadores", descripcion: "Carga inalámbrica hasta 15W con alineación magnética.", precio: 65000 },
  { nombre: "Cargador USB-C 20W", marca: "Apple", compatibilidad: "iPhone / iPad", categoria: "Cargadores", descripcion: "Carga rápida por cable, adaptador de pared.", precio: 45000 },
  { nombre: "Cable USB-C a Lightning 1m", marca: "Apple", compatibilidad: "iPhone con puerto Lightning", categoria: "Cables", descripcion: "Cable original trenzado, 1 metro.", precio: 38000 },
  { nombre: "Funda de silicona iPhone 15", marca: "Apple", compatibilidad: "iPhone 15", categoria: "Fundas", descripcion: "Silicona suave con forro de microfibra.", precio: 55000 },
  { nombre: "Funda transparente iPhone 14", marca: "Genérica", compatibilidad: "iPhone 14", categoria: "Fundas", descripcion: "Protección total, transparente, antiamarillamiento.", precio: 25000 },
  { nombre: "Protector de vidrio templado", marca: "Genérica", compatibilidad: "Todos los modelos iPhone", categoria: "Protectores", descripcion: "Dureza 9H, instalación fácil con aplicador.", precio: 12000 },
  { nombre: "Power Bank MagSafe 5000mAh", marca: "Genérica", compatibilidad: "iPhone 12 en adelante", categoria: "Accesorios", descripcion: "Batería externa magnética, carga inalámbrica.", precio: 58000 },
  { nombre: "EarPods con conector Lightning", marca: "Apple", compatibilidad: "iPhone con puerto Lightning", categoria: "Accesorios", descripcion: "Auriculares con cable, control de volumen y micrófono.", precio: 30000 },
].map((a, i) => ({
  tipo: "accesorio",
  fotos: fotosPlaceholder(a.nombre, 2),
  stockLogico: i % 5 === 0 ? "vendido" : "disponible",
  vendido: i % 5 === 0,
  pocoStock: i % 4 === 0 && i % 5 !== 0,
  etiquetas: i % 3 === 0 ? ["Destacado"] : [],
  destacado: i % 3 === 0,
  garantia: "6 meses",
  observaciones: "",
  visitas: 0,
  consultasWhatsapp: 0,
  ...a,
}));
