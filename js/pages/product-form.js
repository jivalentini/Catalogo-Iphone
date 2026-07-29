// ===================================================================
// Alta / edición de productos (iPhone y accesorios), incluyendo
// subida de imágenes a Storage y reordenamiento por drag & drop.
// ===================================================================
import { db, storage } from "../firebase-config.js";
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { generarCodigo } from "../utils/formato.js";
import { CATEGORIAS, ETIQUETAS_DISPONIBLES } from "../data/categorias.js";
import { crearSelectorEstrellas } from "../components/stars-input.js";

let fotosActuales = [];
let productoEnEdicion = null;
let carpetaStorage = null;
let selectorEstrellas = null;

function $(id) { return document.getElementById(id); }

function pintarChecksEtiquetas() {
  const cont = $("campoEtiquetas");
  cont.innerHTML = ETIQUETAS_DISPONIBLES.map((et) => `
    <label class="check-item"><input type="checkbox" value="${et}" class="chk-etiqueta"> ${et}</label>
  `).join("");
}

function pintarCategorias() {
  const select = $("campoCategoria");
  select.innerHTML = CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function pintarMiniaturas() {
  const cont = $("subidaImagenes");
  cont.innerHTML = "";
  fotosActuales.forEach((url, i) => {
    const div = document.createElement("div");
    div.className = "subida-imagenes__item";
    div.draggable = true;
    div.dataset.index = i;
    div.innerHTML = `<img src="${url}"><button type="button" class="subida-imagenes__quitar" data-i="${i}">&times;</button>`;
    div.addEventListener("dragstart", () => div.classList.add("arrastrando"));
    div.addEventListener("dragend", () => div.classList.remove("arrastrando"));
    div.addEventListener("dragover", (e) => e.preventDefault());
    div.addEventListener("drop", (e) => {
      e.preventDefault();
      const origen = Number(document.querySelector(".arrastrando")?.dataset.index);
      if (Number.isNaN(origen)) return;
      const [movida] = fotosActuales.splice(origen, 1);
      fotosActuales.splice(i, 0, movida);
      pintarMiniaturas();
    });
    cont.appendChild(div);
  });

  if (fotosActuales.length < 10) {
    const agregar = document.createElement("label");
    agregar.className = "subida-imagenes__agregar";
    agregar.innerHTML = `+<input type="file" accept="image/*" multiple style="display:none" id="inputFotos">`;
    cont.appendChild(agregar);
    document.getElementById("inputFotos").addEventListener("change", subirFotos);
  }

  cont.querySelectorAll(".subida-imagenes__quitar").forEach((btn) => {
    btn.addEventListener("click", () => {
      fotosActuales.splice(Number(btn.dataset.i), 1);
      pintarMiniaturas();
    });
  });
}

async function subirFotos(e) {
  const archivos = Array.from(e.target.files).slice(0, 10 - fotosActuales.length);
  for (const archivo of archivos) {
    const path = `products/${carpetaStorage}/${Date.now()}-${archivo.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);
    fotosActuales.push(url);
  }
  pintarMiniaturas();
}

function actualizarVisibilidadCampos() {
  const tipo = $("campoTipo").value;
  document.querySelectorAll(".solo-iphone").forEach((el) => el.classList.toggle("oculto", tipo !== "iphone"));
  document.querySelectorAll(".solo-accesorio").forEach((el) => el.classList.toggle("oculto", tipo !== "accesorio"));
  $("campoCategoria").value = tipo === "iphone" ? "iPhone" : $("campoCategoria").value;
  $("grupoCategoria").classList.toggle("oculto", tipo === "iphone");
}

export function inicializarFormularioProducto({ onGuardado }) {
  pintarChecksEtiquetas();
  pintarCategorias();

  $("campoTipo").addEventListener("change", actualizarVisibilidadCampos);
  $("btnCerrarModalProducto").addEventListener("click", cerrarFormularioProducto);
  $("modalProducto").addEventListener("click", (e) => { if (e.target.id === "modalProducto") cerrarFormularioProducto(); });

  $("formProducto").addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarProducto();
    onGuardado();
  });
}

export function abrirFormularioProducto(producto = null) {
  productoEnEdicion = producto;
  fotosActuales = producto ? [...(producto.fotos || [])] : [];
  carpetaStorage = producto ? producto.codigo : crypto.randomUUID();

  $("tituloModalProducto").textContent = producto ? `Editar ${producto.codigo}` : "Nuevo producto";
  $("campoTipo").value = producto ? producto.tipo : "iphone";
  $("campoTipo").disabled = !!producto;
  actualizarVisibilidadCampos();

  $("campoModelo").value = producto?.modelo || "";
  $("campoCapacidad").value = producto?.capacidad || "";
  $("campoColor").value = producto?.color || "";
  $("campoEstado").value = producto?.estado || "usado";
  $("campoBateria").value = producto?.bateriaPct ?? 100;
  $("campoFaceId").checked = producto?.faceId ?? true;
  $("campoTrueTone").checked = producto?.trueTone ?? true;
  $("campoOriginales").checked = producto?.partesOriginales ?? true;
  $("campoCaja").checked = producto?.caja ?? false;
  $("campoCable").checked = producto?.cable ?? false;
  $("campoCargador").checked = producto?.cargador ?? false;
  $("campoAuriculares").checked = producto?.auriculares ?? false;

  $("campoNombre").value = producto?.nombre || "";
  $("campoMarca").value = producto?.marca || "";
  $("campoCompatibilidad").value = producto?.compatibilidad || "";
  $("campoDescripcionAcc").value = producto?.descripcion || "";
  $("campoStockLogico").value = producto?.stockLogico || "disponible";
  $("campoPocoStock").checked = producto?.pocoStock ?? false;
  if (producto && producto.tipo === "accesorio") $("campoCategoria").value = producto.categoria;

  $("campoPrecio").value = producto?.precio || "";
  $("campoGarantia").value = producto?.garantia || "";
  $("campoObservaciones").value = producto?.observaciones || "";
  $("campoDestacado").checked = producto?.destacado ?? false;

  document.querySelectorAll(".chk-etiqueta").forEach((chk) => {
    chk.checked = (producto?.etiquetas || []).includes(chk.value);
  });

  selectorEstrellas = crearSelectorEstrellas($("campoEstadoEstetico"), producto?.estadoEstetico ?? 5);
  pintarMiniaturas();
  $("modalProducto").classList.add("activo");
}

function cerrarFormularioProducto() {
  $("modalProducto").classList.remove("activo");
}

async function guardarProducto() {
  const tipo = $("campoTipo").value;
  const etiquetas = Array.from(document.querySelectorAll(".chk-etiqueta:checked")).map((c) => c.value);

  const base = {
    tipo,
    categoria: tipo === "iphone" ? "iPhone" : $("campoCategoria").value,
    precio: Number($("campoPrecio").value) || 0,
    garantia: $("campoGarantia").value,
    observaciones: $("campoObservaciones").value,
    destacado: $("campoDestacado").checked,
    etiquetas,
    fotos: fotosActuales,
    actualizadoEn: serverTimestamp(),
  };

  const datosIphone = tipo === "iphone" ? {
    modelo: $("campoModelo").value,
    capacidad: $("campoCapacidad").value,
    color: $("campoColor").value,
    estado: $("campoEstado").value,
    estadoEstetico: selectorEstrellas ? selectorEstrellas.obtenerValor() : (productoEnEdicion?.estadoEstetico ?? 5),
    bateriaPct: Number($("campoBateria").value) || 0,
    faceId: $("campoFaceId").checked,
    trueTone: $("campoTrueTone").checked,
    partesOriginales: $("campoOriginales").checked,
    caja: $("campoCaja").checked,
    cable: $("campoCable").checked,
    cargador: $("campoCargador").checked,
    auriculares: $("campoAuriculares").checked,
  } : {};

  const datosAccesorio = tipo === "accesorio" ? {
    nombre: $("campoNombre").value,
    marca: $("campoMarca").value,
    compatibilidad: $("campoCompatibilidad").value,
    descripcion: $("campoDescripcionAcc").value,
    stockLogico: $("campoStockLogico").value,
    vendido: $("campoStockLogico").value === "vendido",
    pocoStock: $("campoPocoStock").checked,
  } : {};

  const datosFinales = { ...base, ...datosIphone, ...datosAccesorio };

  if (productoEnEdicion) {
    await updateDoc(doc(db, "products", productoEnEdicion.id), datosFinales);
  } else {
    const codigo = await generarCodigo(tipo);
    await setDoc(doc(db, "products", codigo), {
      ...datosFinales,
      codigo,
      visitas: 0,
      consultasWhatsapp: 0,
      vendido: datosFinales.vendido || false,
      stockLogico: datosFinales.stockLogico || "disponible",
      creadoEn: serverTimestamp(),
    });
  }
  cerrarFormularioProducto();
}

export async function eliminarProducto(producto) {
  if (!confirm(`¿Eliminar el producto ${producto.codigo}? Esta acción no se puede deshacer.`)) return;
  await Promise.all((producto.fotos || []).map((url) => {
    try {
      return deleteObject(ref(storage, url));
    } catch { return Promise.resolve(); }
  }));
  await deleteDoc(doc(db, "products", producto.id));
}
