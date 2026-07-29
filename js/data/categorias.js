// ===================================================================
// Categorías del catálogo
// ===================================================================

// Categorías "reales" que puede tener un producto (campo `categoria`)
export const CATEGORIAS = [
  "iPhone",
  "iPad",
  "Apple Watch",
  "AirPods",
  "Cargadores",
  "Cables",
  "Fundas",
  "Protectores",
  "Accesorios",
];

// Chips que se muestran en el catálogo. Los "especiales" no son una
// categoría real sino un filtro inteligente sobre etiquetas/estado.
export const CHIPS_CATALOGO = [
  { id: "todos", nombre: "Todos", tipo: "todos" },
  { id: "ofertas", nombre: "Ofertas", tipo: "especial", campo: "etiquetas", valor: "Oferta" },
  { id: "nuevos", nombre: "Nuevos", tipo: "especial", campo: "estado", valor: "nuevo" },
  { id: "usados", nombre: "Usados", tipo: "especial", campo: "estado", valor: "usado" },
  ...CATEGORIAS.map((c) => ({ id: c.toLowerCase().replace(/\s+/g, "-"), nombre: c, tipo: "categoria", valor: c })),
];

export const ETIQUETAS_DISPONIBLES = [
  "Oferta",
  "Destacado",
  "Nuevo ingreso",
  "Caja completa",
  "Como nuevo",
  "Batería excelente",
];
