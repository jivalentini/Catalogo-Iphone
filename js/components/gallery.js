// ===================================================================
// Galería de imágenes: principal + miniaturas, zoom, swipe, flechas,
// contador y (en modo edición) drag & drop para reordenar
// ===================================================================

export function crearGaleria({ contenedor, fotos, editable = false, onReordenar = null }) {
  let indice = 0;
  let listaFotos = [...fotos];

  contenedor.innerHTML = `
    <div class="galeria__principal">
      <img class="galeria__img" src="" alt="Foto del producto">
      <button class="galeria__flecha izq" aria-label="Anterior">‹</button>
      <button class="galeria__flecha der" aria-label="Siguiente">›</button>
      <span class="galeria__contador"></span>
    </div>
    <div class="galeria__miniaturas"></div>
    <div class="lightbox">
      <span class="lightbox__cerrar">&times;</span>
      <img src="" alt="Zoom">
    </div>
  `;

  const imgPrincipal = contenedor.querySelector(".galeria__img");
  const contador = contenedor.querySelector(".galeria__contador");
  const miniaturas = contenedor.querySelector(".galeria__miniaturas");
  const lightbox = contenedor.querySelector(".lightbox");
  const lightboxImg = lightbox.querySelector("img");

  function pintar() {
    if (!listaFotos.length) {
      imgPrincipal.src = "https://placehold.co/600x600/f5f5f7/6e6e73?text=Sin+foto";
      contador.textContent = "0/0";
      miniaturas.innerHTML = "";
      return;
    }
    imgPrincipal.src = listaFotos[indice];
    contador.textContent = `${indice + 1}/${listaFotos.length}`;

    miniaturas.innerHTML = "";
    listaFotos.forEach((foto, i) => {
      const mini = document.createElement("div");
      mini.className = "galeria__miniatura" + (i === indice ? " activa" : "");
      mini.innerHTML = `<img src="${foto}" alt="Miniatura ${i + 1}">`;
      mini.addEventListener("click", () => { indice = i; pintar(); });

      if (editable) {
        mini.draggable = true;
        mini.dataset.index = i;
        mini.addEventListener("dragstart", (e) => {
          mini.classList.add("arrastrando");
          e.dataTransfer.setData("text/plain", i);
        });
        mini.addEventListener("dragend", () => mini.classList.remove("arrastrando"));
        mini.addEventListener("dragover", (e) => e.preventDefault());
        mini.addEventListener("drop", (e) => {
          e.preventDefault();
          const origen = Number(e.dataTransfer.getData("text/plain"));
          const destino = i;
          const [movida] = listaFotos.splice(origen, 1);
          listaFotos.splice(destino, 0, movida);
          indice = destino;
          pintar();
          if (onReordenar) onReordenar(listaFotos);
        });
      }
      miniaturas.appendChild(mini);
    });
  }

  contenedor.querySelector(".galeria__flecha.izq").addEventListener("click", () => {
    indice = (indice - 1 + listaFotos.length) % listaFotos.length;
    pintar();
  });
  contenedor.querySelector(".galeria__flecha.der").addEventListener("click", () => {
    indice = (indice + 1) % listaFotos.length;
    pintar();
  });

  // Zoom (click para abrir lightbox)
  imgPrincipal.addEventListener("click", () => {
    if (!listaFotos.length) return;
    lightboxImg.src = listaFotos[indice];
    lightbox.classList.add("activo");
  });
  lightbox.addEventListener("click", () => lightbox.classList.remove("activo"));

  // Swipe táctil (móvil)
  let xInicio = null;
  imgPrincipal.addEventListener("touchstart", (e) => { xInicio = e.touches[0].clientX; });
  imgPrincipal.addEventListener("touchend", (e) => {
    if (xInicio === null) return;
    const diferencia = e.changedTouches[0].clientX - xInicio;
    if (Math.abs(diferencia) > 40) {
      indice = diferencia < 0
        ? (indice + 1) % listaFotos.length
        : (indice - 1 + listaFotos.length) % listaFotos.length;
      pintar();
    }
    xInicio = null;
  });

  pintar();

  return {
    obtenerFotos: () => listaFotos,
    actualizarFotos: (nuevas) => { listaFotos = [...nuevas]; indice = 0; pintar(); },
  };
}
