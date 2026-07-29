// ===================================================================
// Lógica de inicio de sesión (empleados y administradores)
// ===================================================================
import { auth, db } from "../firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function iniciarLogin() {
  // Si ya hay sesión activa, redirige directo al dashboard.
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
  });

  const form = document.getElementById("formLogin");
  const mensaje = document.getElementById("mensajeError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensaje.classList.remove("activo");
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists() || snap.data().activo === false) {
        mensaje.textContent = "Tu cuenta no está habilitada. Contactá al administrador.";
        mensaje.classList.add("activo");
        await auth.signOut();
        return;
      }
      window.location.href = "dashboard.html";
    } catch (err) {
      mensaje.textContent = "Email o contraseña incorrectos.";
      mensaje.classList.add("activo");
    }
  });
}
