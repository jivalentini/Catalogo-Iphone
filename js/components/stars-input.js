// ===================================================================
// Selector interactivo de estrellas (1 a 5) para el formulario de producto
// ===================================================================

/**
 * Crea un selector de estrellas dentro de `contenedor`.
 * @param {HTMLElement} contenedor
 * @param {number} valorInicial
 * @param {(valor:number)=>void} onCambio
 */
export function crearSelectorEstrellas(contenedor, valorInicial = 5, onCambio = () => {}) {
  let valor = valorInicial;

  function pintar() {
    contenedor.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = i <= valor ? "★" : "☆";
      btn.style.fontSize = "22px";
      btn.style.color = i <= valor ? "var(--color-advertencia)" : "var(--color-borde)";
      btn.addEventListener("click", () => {
        valor = i;
        pintar();
        onCambio(valor);
      });
      contenedor.appendChild(btn);
    }
  }
  pintar();
  return { obtenerValor: () => valor };
}
