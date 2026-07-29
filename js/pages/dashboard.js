// ===================================================================
// Panel de administración: resumen, productos, empleados y
// configuración visual del negocio.
// ===================================================================
import { app, auth, db } from "../firebase-config.js";
import { requerirSesion, esAdministrador, cerrarSesion } from "../utils/auth-guard.js";
import {
  collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  initializeApp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { subirImagenCloudinary } from "../utils/cloudinary.js";
import { formatearPrecio } from "../utils/formato.js";
import { tituloProducto, fotoPrincipal } from "../components/product-card.js";
import { abrirFormularioProducto, inicializarFormularioProducto, eliminarProducto } from "./product-form.js";

let perfilActual = null;
let productosCache = [];

function $(id) { return document.getElementById(id); }

function irASeccion(nombre) {
  document.querySelectorAll(".seccion-dash").forEach((s) => s.classList.add("oculto"));
  document.querySelectorAll(".dashboard__lateral nav a").forEach((a) => a.classList.remove("activa"));
  $(`seccion-${nombre}`).classList.remove("oculto");
  document.querySelector(`[data-seccion="${nombre}"]`).classList.add("activa");
}

function inicializarNav() {
  document.querySelectorAll("[data-seccion]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      irASeccion(a.dataset.seccion);
    });
  });
  $("btnCerrarSesion").addEventListener("click", cerrarSesion);
}

// ---------------- Resumen / estadísticas ----------------
function suscribirStats() {
  onSnapshot(doc(db, "stats", "global"), (snap) => {
    const datos = snap.exists() ? snap.data() : {};
    $("statVisitas").textContent = datos.visitasCatalogo || 0;
    $("statConsultas").textContent = datos.consultasWhatsapp || 0;
  });
}

function recalcularStatsProductos() {
  const publicados = productosCache.filter((p) => !p.vendido).length;
  const vendidos = productosCache.filter((p) => p.vendido).length;
  const destacados = productosCache.filter((p) => p.destacado).length;
  const pocoStock = productosCache.filter((p) => p.pocoStock).length;
  $("statPublicados").textContent = publicados;
  $("statVendidos").textContent = vendidos;
  $("statDestacados").textContent = destacados;
  $("statPocoStock").textContent = pocoStock;
}

// ---------------- Productos ----------------
function renderizarTablaProductos() {
  const filtroTexto = $("buscarProductoDash").value.toLowerCase();
  const cuerpo = $("cuerpoTablaProductos");
  cuerpo.innerHTML = "";
  productosCache
    .filter((p) => !filtroTexto || JSON.stringify(p).toLowerCase().includes(filtroTexto))
    .forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img class="miniatura" src="${fotoPrincipal(p)}" alt=""></td>
        <td>${p.codigo}</td>
        <td>${tituloProducto(p)}</td>
        <td>${p.categoria}</td>
        <td>${formatearPrecio(p.precio)}</td>
        <td>${p.vendido ? "Vendido" : "Disponible"}</td>
        <td class="acciones-fila">
          <button class="btn-secundario btn-chico" data-editar="${p.id}">Editar</button>
          <button class="btn-peligro btn-chico" data-eliminar="${p.id}">Eliminar</button>
        </td>
      `;
      cuerpo.appendChild(tr);
    });

  cuerpo.querySelectorAll("[data-editar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const producto = productosCache.find((p) => p.id === btn.dataset.editar);
      abrirFormularioProducto(producto);
    });
  });
  cuerpo.querySelectorAll("[data-eliminar]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const producto = productosCache.find((p) => p.id === btn.dataset.eliminar);
      await eliminarProducto(producto);
    });
  });
}

function suscribirProductos() {
  onSnapshot(collection(db, "products"), (snap) => {
    productosCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    recalcularStatsProductos();
    renderizarTablaProductos();
  });
}

function inicializarProductos() {
  $("btnNuevoProducto").addEventListener("click", () => abrirFormularioProducto(null));
  $("buscarProductoDash").addEventListener("input", renderizarTablaProductos);
  inicializarFormularioProducto({ onGuardado: () => {} });
}

// ---------------- Empleados (solo admin) ----------------
function suscribirEmpleados() {
  onSnapshot(collection(db, "users"), (snap) => {
    const cuerpo = $("cuerpoTablaEmpleados");
    cuerpo.innerHTML = "";
    snap.docs.forEach((d) => {
      const u = { id: d.id, ...d.data() };
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.nombre || ""}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
        <td>${u.activo === false ? "Inactivo" : "Activo"}</td>
        <td class="acciones-fila">
          ${u.id !== perfilActual.id ? `<button class="btn-secundario btn-chico" data-toggle="${u.id}" data-activo="${u.activo !== false}">${u.activo === false ? "Activar" : "Desactivar"}</button>` : "<em>vos</em>"}
        </td>
      `;
      cuerpo.appendChild(tr);
    });
    cuerpo.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const activo = btn.dataset.activo === "true";
        await updateDoc(doc(db, "users", btn.dataset.toggle), { activo: !activo });
      });
    });
  });
}

function inicializarEmpleados() {
  $("formNuevoEmpleado").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = $("empNombre").value.trim();
    const email = $("empEmail").value.trim();
    const password = $("empPassword").value;
    const msg = $("msgEmpleado");
    msg.textContent = "Creando...";
    try {
      // Se usa una instancia secundaria de Firebase Auth para crear el
      // usuario sin cerrar la sesión del administrador actual.
      const appSecundaria = initializeApp(app.options, "secundaria-" + Date.now());
      const authSecundaria = getAuth(appSecundaria);
      const cred = await createUserWithEmailAndPassword(authSecundaria, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        nombre, email, rol: "empleado", activo: true, creadoEn: serverTimestamp(),
      });
      await signOut(authSecundaria);
      msg.textContent = "✅ Empleado creado correctamente.";
      msg.style.color = "var(--color-exito)";
      e.target.reset();
    } catch (err) {
      msg.textContent = "Error: " + err.message;
      msg.style.color = "var(--color-error)";
    }
  });
}

// ---------------- Configuración del negocio (solo admin) ----------------
async function cargarConfigNegocio() {
  const snap = await getDoc(doc(db, "config", "negocio"));
  const c = snap.exists() ? snap.data() : {};
  $("cfgNombre").value = c.nombre || "";
  $("cfgWhatsapp").value = c.whatsapp || "";
  $("cfgInstagram").value = c.instagram || "";
  $("cfgFacebook").value = c.facebook || "";
  $("cfgDireccion").value = c.direccion || "";
  $("cfgHorarios").value = c.horarios || "";
  $("cfgColorPrimario").value = c.colorPrimario || "#0071e3";
  $("cfgColorSecundario").value = c.colorSecundario || "#1d1d1f";
  if (c.logoUrl) $("previewLogo").src = c.logoUrl;
  if (c.bannerUrl) $("previewBanner").src = c.bannerUrl;
}

function inicializarConfigNegocio() {
  cargarConfigNegocio();

  $("cfgLogoInput").addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const url = await subirArchivoConfig(archivo, "logo");
    $("previewLogo").src = url;
  });
  $("cfgBannerInput").addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const url = await subirArchivoConfig(archivo, "banner");
    $("previewBanner").src = url;
  });

  $("formConfigNegocio").addEventListener("submit", async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "config", "negocio"), {
      nombre: $("cfgNombre").value,
      whatsapp: $("cfgWhatsapp").value.replace(/\D/g, ""),
      instagram: $("cfgInstagram").value,
      facebook: $("cfgFacebook").value,
      direccion: $("cfgDireccion").value,
      horarios: $("cfgHorarios").value,
      colorPrimario: $("cfgColorPrimario").value,
      colorSecundario: $("cfgColorSecundario").value,
      logoUrl: $("previewLogo").src,
      bannerUrl: $("previewBanner").src,
    }, { merge: true });
    $("msgConfigNegocio").textContent = "✅ Configuración guardada.";
    $("msgConfigNegocio").style.color = "var(--color-exito)";
  });
}

async function subirArchivoConfig(archivo, nombre) {
  return subirImagenCloudinary(archivo, `config/${nombre}`);
}

// ---------------- Inicio ----------------
export async function iniciarDashboard() {
  const { perfil } = await requerirSesion();
  perfilActual = perfil;

  $("nombreUsuarioDash").textContent = perfil.nombre || perfil.email;
  $("rolUsuarioDash").textContent = perfil.rol;

  if (!esAdministrador(perfil)) {
    document.querySelectorAll(".solo-admin").forEach((el) => el.classList.add("oculto"));
  }

  inicializarNav();
  inicializarProductos();
  suscribirProductos();
  suscribirStats();

  if (esAdministrador(perfil)) {
    inicializarEmpleados();
    suscribirEmpleados();
    inicializarConfigNegocio();
  }
}
