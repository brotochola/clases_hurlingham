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

