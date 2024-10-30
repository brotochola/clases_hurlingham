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

function radians_to_degrees(radians) {
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply radians by 180 divided by pi to convert to degrees.
  return radians * (180 / pi);
}

function calcularFuerzaGravedad(m1, m2, r) {
  const G = 6.6743e-11; // Constante de gravitación universal en m^3 kg^-1 s^-2
  return (G * m1 * m2) / (r * r);
}

function calcularDistancia(x1, y1, x2, y2) {
  const dx = x2 - x1; // Diferencia en la coordenada x
  const dy = y2 - y1; // Diferencia en la coordenada y
  return Math.sqrt(dx * dx + dy * dy); // Calcula la raíz cuadrada de la suma de los cuadrados
}
function obtenerColorAleatorioHex() {
  // Genera un número hexadecimal aleatorio entre 0x000000 y 0xFFFFFF
  const color = Math.floor(Math.random() * 0xffffff);

  // Convierte el número a una cadena hexadecimal y añade el prefijo 0x
  return `0x${color.toString(16).padStart(6, "0")}`;
}
function rectangulosSeSolapan(rect1, rect2) {
  // Cálculo de los límites de rect1 (rectángulo 1)
  const rect1Izquierda = rect1.x - rect1.ancho / 2;
  const rect1Derecha = rect1.x + rect1.ancho / 2;
  const rect1Superior = rect1.y - rect1.alto;
  const rect1Inferior = rect1.y;

  // Cálculo de los límites de rect2 (rectángulo 2)
  const rect2Izquierda = rect2.x - rect2.ancho / 2;
  const rect2Derecha = rect2.x + rect2.ancho / 2;
  const rect2Superior = rect2.y - rect2.alto;
  const rect2Inferior = rect2.y;

  // Verificar colisión: se solapan si los límites se cruzan en ambos ejes
  const colisionX =
    rect1Izquierda < rect2Derecha && rect1Derecha > rect2Izquierda;
  const colisionY =
    rect1Superior < rect2Inferior && rect1Inferior > rect2Superior;

  return colisionX && colisionY;
}

function generarNombreAleatorio() {
  const prefijos = [
    "Al",
    "Ber",
    "Car",
    "Da",
    "El",
    "Fe",
    "Ga",
    "Har",
    "In",
    "Jo",
    "Ki",
    "La",
    "Mi",
    "Nor",
    "Or",
    "Per",
    "Qui",
    "Ro",
    "Su",
    "Tri",
    "Ul",
    "Vi",
    "Wil",
    "Xan",
    "Yan",
    "Zan",
  ];
  const sufijos = [
    "ton",
    "lis",
    "bert",
    "dia",
    "mond",
    "fer",
    "rian",
    "so",
    "lin",
    "fin",
    "dor",
    "vas",
    "nus",
    "leo",
    "gus",
    "mir",
    "los",
    "ter",
    "xen",
    "zen",
    "frey",
    "dral",
    "wen",
  ];

  // Elegir prefijo y sufijo al azar
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const sufijo = sufijos[Math.floor(Math.random() * sufijos.length)];

  return prefijo + sufijo;
}
