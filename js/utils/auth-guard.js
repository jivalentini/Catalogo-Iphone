// ===================================================================
// Protección de rutas: valida sesión y rol contra Firestore (users/{uid})
// ===================================================================
import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Espera la sesión y devuelve { user, perfil } o redirige a login.html
 * si no hay sesión activa o el usuario no está habilitado.
 */
export function requerirSesion({ redireccion = "login.html" } = {}) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = redireccion;
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().activo === false) {
        await signOut(auth);
        window.location.href = redireccion;
        return;
      }
      resolve({ user, perfil: { id: snap.id, ...snap.data() } });
    });
  });
}

export function esAdministrador(perfil) {
  return perfil?.rol === "administrador";
}

export async function cerrarSesion() {
  await signOut(auth);
  window.location.href = "login.html";
}
