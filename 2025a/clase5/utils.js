function getUnitVector(objX, objY, mouseX, mouseY) {
  // Paso 1: Vector dirección
  let dx = mouseX - objX;
  let dy = mouseY - objY;

  // Paso 2: Magnitud (longitud del vector)
  let length = Math.sqrt(dx * dx + dy * dy);

  // Paso 3: Evitar dividir por cero
  if (length === 0) return { x: 0, y: 0 };

  // Paso 4: Normalizar
  return {
    x: dx / length,
    y: dy / length,
  };
}

function calcularDistancia(difX, difY) {
  return Math.sqrt(difX ** 2 + difY ** 2);
}
