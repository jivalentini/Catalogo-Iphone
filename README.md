# Catálogo de iPhone y Accesorios

Producto comercial de catálogo online para tiendas de venta de iPhone y
accesorios. Cada cliente despliega su propia instalación independiente
(no es multi-tenant), sin backend propio: HTML + CSS + JavaScript puro
conectado a Firebase (Authentication y Firestore, ambos gratis sin
tarjeta) y Cloudinary (almacenamiento de imágenes, también gratis),
hosteado en GitHub Pages.

> **Por qué Cloudinary y no Firebase Storage:** desde febrero de 2026,
> Firebase exige tener el plan de pago Blaze activado (con tarjeta
> cargada) para usar Cloud Storage, aunque el consumo real sea gratuito.
> Como este catálogo se vende a múltiples negocios, cada uno con su
> propio proyecto de Firebase, eso significaría pedirle tarjeta a cada
> cliente. Cloudinary resuelve solo el almacenamiento de imágenes con un
> nivel gratuito permanente (25GB) y sin tarjeta, dejando Auth y
> Firestore en Firebase (que siguen sin costo).

## Índice

1. Instalación
2. Configuración de Firebase
3. Configuración de Cloudinary (imágenes)
4. Publicar en GitHub Pages
5. Crear el administrador
6. Crear empleados
7. Personalizar el negocio
8. Estructura del proyecto
9. Modelo de datos en Firestore
10. Seguridad de `seed.html`

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
   - No hace falta activar **Storage**: las imágenes se manejan con
     Cloudinary (paso siguiente).
5. Subí las reglas de seguridad de Firestore incluidas en este proyecto:
   `firestore.rules` → Firestore Database → Reglas → pegar el
   contenido → Publicar.

   (Si usás Firebase CLI: `firebase deploy --only firestore:rules`.)

## 3. Configuración de Cloudinary (imágenes)

Las fotos de productos, el logo y el banner del negocio se suben a
[Cloudinary](https://cloudinary.com), que tiene un nivel gratuito
permanente (25GB de almacenamiento y 25GB de transferencia por mes) sin
pedir tarjeta.

1. Creá una cuenta gratuita en [cloudinary.com](https://cloudinary.com).
2. En el Dashboard, copiá tu **Cloud Name** (aparece arriba de todo).
3. Andá a **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing Mode**: elegí **Unsigned** (necesario porque este
     proyecto no tiene backend que firme las subidas).
   - Ponele un nombre corto (por ejemplo `catalogo-iphone`) y guardá.
4. Pegá esos dos datos en `js/utils/cloudinary.js`, reemplazando los
   placeholders:
   ```js
   export const CLOUDINARY_CLOUD_NAME = "tu-cloud-name";
   export const CLOUDINARY_UPLOAD_PRESET = "catalogo-iphone";
   ```

Con un preset **Unsigned**, cualquiera que conozca esos dos valores
podría subir imágenes a tu cuenta (no borrar ni leer datos privados,
solo subir). Para un catálogo comercial esto es un riesgo bajo y
aceptado — si te preocupa, podés limitar el preset a ciertos formatos o
tamaños máximos desde la configuración del preset en Cloudinary.

## 4. Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub y subí todo el contenido de esta
   carpeta a la rama `main`.
2. En el repositorio: **Settings → Pages → Source**: elegí la rama
   `main` y la carpeta raíz (`/`).
3. GitHub te va a dar una URL pública (`https://usuario.github.io/repo/`).
   Esa es la dirección del catálogo para compartir con clientes.
4. En Firebase → Authentication → Settings → "Authorized domains",
   agregá ese dominio de GitHub Pages (si no, el login falla).

## 5. Crear el administrador

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

## 6. Crear empleados

Desde `dashboard.html` → sección **Empleados** (solo visible para el
administrador): completá nombre, email y contraseña, y el sistema crea
la cuenta con `rol: empleado`. Los empleados pueden dar de alta, editar
y eliminar productos y gestionar imágenes, pero no pueden administrar
usuarios ni la configuración visual del negocio.

Para dar de baja a un empleado no hace falta borrarlo: en la tabla de
empleados hay un botón "Desactivar" que le bloquea el acceso sin perder
el historial.

## 7. Personalizar el negocio

Desde `dashboard.html` → sección **Configuración** (solo administrador)
se edita, sin tocar código: nombre del negocio, logo, banner, colores
primario/secundario, número de WhatsApp, Instagram, Facebook, dirección
y horarios. Los cambios se reflejan al instante en el catálogo público.

## 8. Estructura del proyecto

```
index.html              Catálogo público (buscador, filtros, grilla)
producto.html           Detalle de producto (galería, specs, WhatsApp)
login.html              Login de empleados/administradores
dashboard.html          Panel: resumen, productos, empleados, config
seed.html               Configuración inicial (crear admin + datos demo)
css/styles.css          Estilos globales
js/firebase-config.js   Credenciales del proyecto Firebase (Auth + Firestore)
js/data/                Categorías y datos de ejemplo (seed)
js/utils/                Formato, WhatsApp, protección de rutas, subida a Cloudinary
js/components/           Tarjeta de producto, galería, selector de estrellas
js/pages/                Lógica de cada página
firestore.rules          Reglas de seguridad de Firestore
storage.rules            Sin uso (se dejó documentado por qué se dejó de usar Firebase Storage)
```

Arquitectura modular con componentes reutilizables (ES modules),
responsive y con una estética inspirada en Apple (tipografía del
sistema, blancos y grises, tarjetas redondeadas, acentos en azul).

## 9. Modelo de datos en Firestore

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

## 10. Seguridad de `seed.html`

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
