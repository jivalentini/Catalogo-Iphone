# ESPECIFICACIÓN DEL PRODUCTO - Catálogo Comercial para Tiendas de iPhone

> Documento base para Claude Code.

## Objetivo

Desarrollar un **producto comercial** listo para vender a múltiples
negocios de venta de iPhone y accesorios. Cada cliente tendrá su propia
instalación independiente (no multi-tenant), desplegable en GitHub
Pages.

## Stack obligatorio

-   HTML5 + CSS3 + JavaScript ES6 (o React/Vite si mejora la
    arquitectura).
-   Firebase Authentication.
-   Firebase Firestore.
-   Firebase Storage.
-   Hosting en GitHub Pages.
-   Sin backend propio.

## Roles

### Cliente

-   Sin login.
-   Navega el catálogo.
-   Busca y filtra.
-   Consulta por WhatsApp.

### Empleado

-   Login.
-   Alta, baja y modificación de productos.
-   Gestión de imágenes.
-   No administra usuarios.

### Administrador

-   Todo lo del empleado.
-   Gestión de empleados.
-   Configuración visual del negocio.
-   Dashboard y estadísticas.

## Catálogo

Categorías: - iPhone - iPad - Apple Watch - AirPods - Cargadores -
Cables - Fundas - Protectores - Accesorios - Ofertas - Nuevos - Usados

Buscador predictivo en tiempo real por: Modelo, color, capacidad,
batería, categoría, descripción y etiquetas.

Filtros: Precio, categoría, estado, batería, Face ID, caja, originales,
etc.

## Producto iPhone

Campos: - Código automático (IP-000001) - Modelo - Capacidad - Color -
Precio - Estado - Estado estético (5 estrellas) - Barra visual de
batería - % batería - Face ID - True Tone - Partes originales - Caja -
Cable - Cargador - Auriculares - Garantía - Observaciones - Hasta 10
fotos

Galería: - Foto principal - Miniaturas - Drag & drop para reordenar -
Zoom - Swipe móvil - Flechas - Contador 1/10

## Accesorios

Código ACC-000001, marca, compatibilidad, descripción, stock lógico
(Disponible/Vendido), imágenes.

## Etiquetas

Oferta, Destacado, Nuevo ingreso, Caja completa, Como nuevo, Batería
excelente y personalizadas.

## WhatsApp

Botón consultar que envía: "Hola, vi el producto IP-000001 (Nombre del
producto) publicado en su catálogo y quisiera más información."

## Dashboard

-   Productos publicados
-   Vendidos
-   Visitas
-   Consultas WhatsApp
-   Destacados
-   Poco stock lógico

## Configuración gráfica

Editable sin código: - Logo - Nombre - Banner - Colores - WhatsApp -
Instagram - Facebook - Dirección - Horarios

## Arquitectura

Proyecto modular, limpio, escalable, componentes reutilizables,
responsive, estilo Apple.

## Firebase

Colecciones: - config - users - products - categories - stats

Reglas para separar permisos entre administrador y empleado.

## Datos iniciales

30 productos: - 20 iPhone variados (11 a 16 Pro Max) - 10 accesorios
(AirPods, MagSafe, cables, fundas, etc.)

Cada producto con imágenes placeholder, precio, descripción y datos
completos.

## README

Explicar: - Instalación - Configuración Firebase - GitHub Pages - Crear
administrador - Crear empleados - Personalizar negocio

## Calidad

No realizar un prototipo. Construir un software comercial listo para
vender, mantenible, optimizado, documentado y preparado para
evolucionar.
