// utils.js

function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

function normalizarVector(x, y) {
  if (x == 0 && y == 0) {
    return null;
  }

  let magnitud = calculoDeDistanciaRapido(0, 0, x, y);

  if (magnitud == 0) return null;

  let rta = { x, y };

  rta.x /= magnitud;
  rta.y /= magnitud;

  return rta;
}

function calculoDeDistanciaRapido(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  if (dx > dy) {
    return dx + 0.4 * dy;
  } else {
    return dy + 0.4 * dx;
  }
}

// Función para calcular la distancia entre dos puntos
function calculoDeDistancia(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// utils.js

/**
 * Calcula la distancia al cuadrado entre dos puntos.
 * @param {number} x1 - La coordenada x del primer punto.
 * @param {number} y1 - La coordenada y del primer punto.
 * @param {number} x2 - La coordenada x del segundo punto.
 * @param {number} y2 - La coordenada y del segundo punto.
 * @returns {number} La distancia al cuadrado entre los dos puntos.
 */
function distanciaAlCuadrado(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

function generarID(longitud = 8) {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < longitud; i++) {
    id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return id;
}

function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}