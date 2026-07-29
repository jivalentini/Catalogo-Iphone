// ===================================================================
// Configuración de Firebase
// -------------------------------------------------------------------
// Reemplazá estos valores por los de tu propio proyecto de Firebase.
// Los obtenés en: Firebase Console > Configuración del proyecto >
// Tus apps > Configuración del SDK.
// Ver README.md sección "Configuración de Firebase" para el paso a paso.
// ===================================================================

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Nota: ya no se usa Firebase Storage (desde feb-2026 requiere el plan
// pago Blaze). Las imágenes se suben a Cloudinary — ver js/utils/cloudinary.js.

export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "catalogo-iphone-5886c.firebaseapp.com",
  projectId: "catalogo-iphone-5886c",
  storageBucket: "catalogo-iphone-5886c.appspot.com",
  messagingSenderId: "338455641366",
  appId: "catalogo-iphone-5886c",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
