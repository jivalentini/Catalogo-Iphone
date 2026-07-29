// ===================================================================
// Lógica de la página pública del catálogo (index.html)
// ===================================================================
import { db } from "../firebase-config.js";
import {
  collection, onSnapshot, doc, getDoc, setDoc, increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { CHIPS_CATALOGO } from "../data/categorias.js";
import { crearTarjetaProducto, tituloProducto, fotoPrincipal } from "../components/product-card.js";
import { debounce, formatearPrecio } from "../utils/formato.js";

let todosLosProductos = [];
let chipActivo = "todos";
let textoBusqueda = "";
let filtrosAvanzados = {};
let configNegocio = {};

async function cargarConfiguracion() {
  const snap = await getDoc(doc(db, "config", "negocio"));
  configNegocio = snap.exists() ? snap.data() : {};

  document.documentElement.style.setProperty("--color-primario", configNegocio.colorPrimario || "#0071e3");
  document.documentElement.style.setProperty("--color-secundario", configNegocio.colorSecundario || "#1d1d1f");

  document.title = configNegocio.nombre ? `${configNegocio.nombre} · Catálogo` : "Catálogo de iPhone";

  const elNombre = document.querySelectorAll("[data-negocio-nombre]");
  elNombre.forEach((el) => (el.textContent = configNegocio.nombre || "Mi Tienda iPhone"));

  const elLogo = document.querySelector("[data-negocio-logo]");
  if (elLogo && configNegocio.logoUrl) elLogo.src = configNegocio.logoUrl;

  const elBanner = document.querySelector("[data-negocio-banner]");
  if (elBanner && configNegocio.bannerUrl) elBanner.style.backgroundImage = `url(${configNegocio.bannerUrl})`;

  const elDireccion = document.querySelector("[data-negocio-direccion]");
  if (elDireccion) elDireccion.textContent = configNegocio.direccion || "";

  const elHorarios = document.querySelector("[data-negocio-horarios]");
  if (elHorarios) elHorarios.textContent = configNegocio.horarios || "";

  const elInsta = document.querySelector("[data-negocio-instagram]");
  if (elInsta) elInsta.href = configNegocio.instagram || "#";

  const elFb = document.querySelector("[data-negocio-facebook]");
  if (elFb) elFb.href = configNegocio.facebook || "#";
}

function registrarVisita() {
  setDoc(doc(db, "stats", "global"), { visitasCatalogo: increment(1) }, { merge: true }).catch(() => {});
}

function pintarChips() {
  const cont = document.getElementById("chipsCategoria");
  if (!cont) return;
  cont.innerHTML = "";
  CHIPS_CATALOGO.forEach((chip) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (chip.id === chipActivo ? " activo" : "");
    btn.textContent = chip.nombre;
    btn.addEventListener("click", () => {
      chipActivo = chip.id;
      pintarChips();
      aplicarFiltrosYRenderizar();
    });
    cont.appendChild(btn);
  });
}

function coincideChip(producto, chip) {
  if (!chip || chip.tipo === "todos") return true;
  if (chip.tipo === "categoria") return producto.categoria === chip.valor;
  if (chip.tipo === "especial") {
    if (chip.campo === "etiquetas") return (producto.etiquetas || []).includes(chip.valor);
    return producto[chip.campo] === chip.valor;
  }
  return true;
}

function coincideTexto(producto, texto) {
  if (!texto) return true;
  const campos = [
    producto.modelo, producto.nombre, producto.color, producto.capacidad,
    producto.categoria, producto.descripcion, producto.marca,
    ...(producto.etiquetas || []),
    producto.bateriaPct ? `${producto.bateriaPct}%` : "",
  ].filter(Boolean).join(" ").toLowerCase();
  return campos.includes(texto.toLowerCase());
}

function coincideFiltros(producto, f) {
  if (f.precioMin && producto.precio < Number(f.precioMin)) return false;
  if (f.precioMax && producto.precio > Number(f.precioMax)) return false;
  if (f.categoria && producto.categoria !== f.categoria) return false;
  if (f.estado && producto.estado !== f.estado) return false;
  if (f.bateriaMin && (producto.bateriaPct || 0) < Number(f.bateriaMin)) return false;
  if (f.faceId && !producto.faceId) return false;
  if (f.caja && !producto.caja) return false;
  if (f.originales && !producto.partesOriginales) return false;
  return true;
}

function aplicarFiltrosYRenderizar() {
  const chip = CHIPS_CATALOGO.find((c) => c.id === chipActivo);
  const resultado = todosLosProductos.filter((p) =>
    coincideChip(p, chip) && coincideTexto(p, textoBusqueda) && coincideFiltros(p, filtrosAvanzados)
  );
  renderizarGrid(resultado);
}

function renderizarGrid(lista) {
  const grid = document.getElementById("gridProductos");
  const vacio = document.getElementById("estadoVacio");
  grid.innerHTML = "";
  if (!lista.length) {
    vacio.classList.remove("oculto");
    return;
  }
  vacio.classList.add("oculto");
  lista
    .sort((a, b) => (b.destacado === true) - (a.destacado === true))
    .forEach((p) => grid.appendChild(crearTarjetaProducto(p)));
}

function inicializarBuscador() {
  const input = document.getElementById("inputBuscador");
  const sugerencias = document.getElementById("cajaSugerencias");

  const buscar = debounce((valor) => {
    textoBusqueda = valor.trim();
    aplicarFiltrosYRenderizar();

    if (!textoBusqueda) {
      sugerencias.classList.remove("activo");
      sugerencias.innerHTML = "";
      return;
    }
    const coincidencias = todosLosProductos.filter((p) => coincideTexto(p, textoBusqueda)).slice(0, 6);
    sugerencias.innerHTML = coincidencias.map((p) => `
      <a class="buscador__sugerencia" href="producto.html?id=${p.id}">
        <img src="${fotoPrincipal(p)}" alt="">
        <div>
          <span>${tituloProducto(p)}</span>
          <small>${p.codigo} · ${formatearPrecio(p.precio)}</small>
        </div>
      </a>`).join("");
    sugerencias.classList.toggle("activo", coincidencias.length > 0);
  }, 200);

  input.addEventListener("input", (e) => buscar(e.target.value));
  document.addEventListener("click", (e) => {
    if (!sugerencias.contains(e.target) && e.target !== input) sugerencias.classList.remove("activo");
  });
}

function inicializarFiltros() {
  const btnToggle = document.getElementById("btnFiltros");
  const panel = document.getElementById("panelFiltros");
  btnToggle.addEventListener("click", () => panel.classList.toggle("activo"));

  document.getElementById("btnAplicarFiltros").addEventListener("click", () => {
    filtrosAvanzados = {
      precioMin: document.getElementById("filtroPrecioMin").value,
      precioMax: document.getElementById("filtroPrecioMax").value,
      estado: document.getElementById("filtroEstado").value,
      bateriaMin: document.getElementById("filtroBateria").value,
      faceId: document.getElementById("filtroFaceId").checked,
      caja: document.getElementById("filtroCaja").checked,
      originales: document.getElementById("filtroOriginales").checked,
    };
    aplicarFiltrosYRenderizar();
  });

  document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
    filtrosAvanzados = {};
    document.querySelectorAll("#panelFiltros input").forEach((el) => {
      if (el.type === "checkbox") el.checked = false; else el.value = "";
    });
    aplicarFiltrosYRenderizar();
  });
}

function suscribirProductos() {
  onSnapshot(collection(db, "products"), (snap) => {
    todosLosProductos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    aplicarFiltrosYRenderizar();
  });
}

export async function iniciarCatalogo() {
  await cargarConfiguracion();
  registrarVisita();
  pintarChips();
  inicializarBuscador();
  inicializarFiltros();
  suscribirProductos();
}
