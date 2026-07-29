// ===================================================================
// Script de configuración inicial (usar UNA sola vez):
//  - Crea la cuenta de administrador
//  - Carga configuración visual por defecto
//  - Carga categorías y 30 productos de ejemplo
// Se ejecuta desde seed.html. Ver README para más detalle.
// ===================================================================
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, getDoc, collection, getDocs, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { CATEGORIAS } from "./data/categorias.js";
import { IPHONES_SEED, ACCESORIOS_SEED } from "./data/seed-productos.js";

export async function crearAdministrador({ nombre, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    nombre,
    email,
    rol: "administrador",
    activo: true,
    creadoEn: serverTimestamp(),
  });
  return cred.user.uid;
}

export async function yaHayProductos() {
  const snap = await getDocs(collection(db, "products"));
  return !snap.empty;
}

export async function ejecutarSeed(logCallback = () => {}) {
  // 1. Configuración visual por defecto (no pisa si ya existe)
  const configRef = doc(db, "config", "negocio");
  const configSnap = await getDoc(configRef);
  if (!configSnap.exists()) {
    await setDoc(configRef, {
      nombre: "Mi Tienda iPhone",
      logoUrl: "https://placehold.co/128x128/1d1d1f/ffffff?text=Logo",
      bannerUrl: "https://placehold.co/1600x500/0071e3/ffffff?text=Mi+Tienda+iPhone",
      colorPrimario: "#0071e3",
      colorSecundario: "#1d1d1f",
      whatsapp: "5491100000000",
      instagram: "",
      facebook: "",
      direccion: "",
      horarios: "Lunes a sábado de 9 a 19 hs",
    });
    logCallback("Configuración visual por defecto creada.");
  } else {
    logCallback("La configuración visual ya existía, no se modificó.");
  }

  await setDoc(doc(db, "config", "contadores"), { iphone: 0, accesorio: 0 }, { merge: true });

  // 2. Categorías
  for (const [i, nombre] of CATEGORIAS.entries()) {
    const id = nombre.toLowerCase().replace(/\s+/g, "-");
    await setDoc(doc(db, "categories", id), { nombre, orden: i });
  }
  logCallback(`${CATEGORIAS.length} categorías cargadas.`);

  // 3. Productos (iPhone)
  let contadorIp = 0;
  for (const producto of IPHONES_SEED) {
    contadorIp++;
    const codigo = `IP-${String(contadorIp).padStart(6, "0")}`;
    await setDoc(doc(db, "products", codigo), {
      ...producto,
      codigo,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  }
  await setDoc(doc(db, "config", "contadores"), { iphone: contadorIp }, { merge: true });
  logCallback(`${IPHONES_SEED.length} iPhone cargados.`);

  // 4. Productos (accesorios)
  let contadorAcc = 0;
  for (const producto of ACCESORIOS_SEED) {
    contadorAcc++;
    const codigo = `ACC-${String(contadorAcc).padStart(6, "0")}`;
    await setDoc(doc(db, "products", codigo), {
      ...producto,
      codigo,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  }
  await setDoc(doc(db, "config", "contadores"), { accesorio: contadorAcc }, { merge: true });
  logCallback(`${ACCESORIOS_SEED.length} accesorios cargados.`);

  logCallback("✅ Carga inicial completa.");
}
