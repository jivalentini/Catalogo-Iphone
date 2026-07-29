# Catálogo de iPhone y Accesorios

Producto comercial de catálogo online para tiendas de venta de iPhone y
accesorios. Cada cliente despliega su propia instalación independiente
(no es multi-tenant), sin backend propio: HTML + CSS + JavaScript puro
conectado a Firebase (Authentication, Firestore y Storage), hosteado en
GitHub Pages.

## Índice

1. Instalación
2. Configuración de Firebase
3. Publicar en GitHub Pages
4. Crear el administrador
5. Crear empleados
6. Personalizar el negocio
7. Estructura del proyecto
8. Modelo de datos en Firestore
9. Seguridad de `seed.html`

---

## 1. Instalación

No requiere `npm install` ni build: es HTML/CSS/JS puro. Alcanza con:

1. Tener un editor de código (VS Code, por ejemplo) y un navegador.
2. Clonar o descargar esta carpeta.
3. Completar la configuración de Firebase (paso 2).
4. Abrir `index.html` con un servidor local (por ejemplo, la extensión
   "Live Server" de VS Code, o `npx serve`). No abrir el archivo
   directamente con `file://`, porque los módulos ES6 (`type="module"`)
   no funcionan sin servidor HTTP.

## 2. Configuración de Firebase

1. Entrá a [Firebase Console](https://console.firebase.google.com) y
   creá un proyecto nuevo (uno por cada cliente/negocio).
2. Dentro del proyecto, agregá una app web (ícono `</>`), ponele un
   nombre y copiá el objeto `firebaseConfig` que te muestra.
3. Pegá esos valores en `js/firebase-config.js`, reemplazando los
   placeholders (`TU_API_KEY`, `TU_PROYECTO`, etc.).
4. Activá los siguientes productos desde el menú lateral de Firebase:
   - **Authentication** → pestaña "Sign-in method" → habilitar
     "Correo electrónico/contraseña".
   - **Firestore Database** → crear base de datos (modo producción).
   - **Storage** → activar el bucket.
5. Subí las reglas de seguridad incluidas en este proyecto:
   - `firestore.rules` → Firestore Database → Reglas → pegar el
     contenido → Publicar.
   - `storage.rules` → Storage → Reglas → pegar el contenido → Publicar.

   (Si usás Firebase CLI: `firebase deploy --only firestore:rules,storage`.)

## 3. Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub y subí todo el contenido de esta
   carpeta a la rama `main`.
2. En el repositorio: **Settings → Pages → Source**: elegí la rama
   `main` y la carpeta raíz (`/`).
3. GitHub te va a dar una URL pública (`https://usuario.github.io/repo/`).
   Esa es la dirección del catálogo para compartir con clientes.
4. En Firebase → Authentication → Settings → "Authorized domains",
   agregá ese dominio de GitHub Pages (si no, el login falla).

## 4. Crear el administrador

Al ser un producto sin backend propio, la primera cuenta se crea desde
una página de configuración incluida: `seed.html`.

1. Publicado el sitio (o corriéndolo local), abrí `seed.html`.
2. Completá nombre, email y contraseña en "1. Crear cuenta de
   administrador" y confirmá. Esto crea el usuario en Firebase
   Authentication y su perfil (`rol: administrador`) en Firestore.
3. En la misma página, sección "2. Cargar datos iniciales", cargá la
   configuración visual por defecto, las categorías y los 30 productos
   de ejemplo (20 iPhone + 10 accesorios con fotos placeholder).
4. Iniciá sesión en `login.html` con esa cuenta y entrá a
   `dashboard.html`.

## 5. Crear empleados

Desde `dashboard.html` → sección **Empleados** (solo visible para el
administrador): completá nombre, email y contraseña, y el sistema crea
la cuenta con `rol: empleado`. Los empleados pueden dar de alta, editar
y eliminar productos y gestionar imágenes, pero no pueden administrar
usuarios ni la configuración visual del negocio.

Para dar de baja a un empleado no hace falta borrarlo: en la tabla de
empleados hay un botón "Desactivar" que le bloquea el acceso sin perder
el historial.

## 6. Personalizar el negocio

Desde `dashboard.html` → sección **Configuración** (solo administrador)
se edita, sin tocar código: nombre del negocio, logo, banner, colores
primario/secundario, número de WhatsApp, Instagram, Facebook, dirección
y horarios. Los cambios se reflejan al instante en el catálogo público.

## 7. Estructura del proyecto

```
index.html              Catálogo público (buscador, filtros, grilla)
producto.html           Detalle de producto (galería, specs, WhatsApp)
login.html              Login de empleados/administradores
dashboard.html          Panel: resumen, productos, empleados, config
seed.html               Configuración inicial (crear admin + datos demo)
css/styles.css          Estilos globales
js/firebase-config.js   Credenciales del proyecto Firebase
js/data/                Categorías y datos de ejemplo (seed)
js/utils/                Formato, WhatsApp, protección de rutas
js/components/           Tarjeta de producto, galería, selector de estrellas
js/pages/                Lógica de cada página
firestore.rules          Reglas de seguridad de Firestore
storage.rules            Reglas de seguridad de Storage
```

Arquitectura modular con componentes reutilizables (ES modules),
responsive y con una estética inspirada en Apple (tipografía del
sistema, blancos y grises, tarjetas redondeadas, acentos en azul).

## 8. Modelo de datos en Firestore

- **config**
  - `negocio`: nombre, logoUrl, bannerUrl, colorPrimario, colorSecundario, whatsapp, instagram, facebook, direccion, horarios.
  - `contadores`: `iphone` y `accesorio` (para el código automático IP-000001 / ACC-000001).
- **users**: `nombre`, `email`, `rol` (`administrador` | `empleado`), `activo`.
- **products**: código, tipo (`iphone`|`accesorio`), categoría, precio,
  estado, estado estético, batería, Face ID, True Tone, partes
  originales, caja/cable/cargador/auriculares, garantía, observaciones,
  fotos (hasta 10), etiquetas, destacado, stock lógico, vendido,
  visitas, consultas de WhatsApp.
- **categories**: lista de categorías (iPhone, iPad, Apple Watch,
  AirPods, Cargadores, Cables, Fundas, Protectores, Accesorios).
- **stats**: `global` con `visitasCatalogo` y `consultasWhatsapp`.

## 9. Seguridad de `seed.html`

Esta página permite crear cuentas de administrador y cargar datos de
ejemplo, por eso **no debe quedar accesible una vez configurado el
negocio**. Después de usarla:

- Eliminala del repositorio (`git rm seed.html js/seed.js` y push), o
- Restringila manualmente (por ejemplo, protegiéndola con autenticación
  a nivel de hosting, o simplemente no compartiendo su URL — igualmente
  se recomienda eliminarla para producción).

Las reglas de Firestore ya impiden que un usuario no autenticado
modifique `products`, `categories`, `config` o `users`, pero la
creación de la *primera* cuenta de administrador no puede protegerse
por reglas (todavía no existe ningún admin), así que la protección
recae en no dejar `seed.html` publicada indefinidamente.

**Importante — reforzar `firestore.rules` después del primer admin:**
`firestore.rules` incluye temporalmente `allow create: if estaLogueado();`
en la colección `users`, necesario solo para poder crear el primer
administrador. Una vez que ya creaste esa cuenta desde `seed.html`,
entrá a Firebase Console → Firestore → Reglas y reemplazá esa línea por:

```
allow create: if esAdministrador();
```

y publicá de nuevo. Así ningún otro usuario podrá auto-asignarse un rol.

## Calidad

Este proyecto está pensado como software comercial listo para vender,
no como prototipo: código modular, mantenible y documentado, preparado
para escalar (nuevas categorías, campos o roles) sin reescribir la
base.
