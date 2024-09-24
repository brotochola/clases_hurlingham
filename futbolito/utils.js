
function generateRandomID(length = 8) {
  // Conjunto de caracteres alfanuméricos (mayúsculas, minúsculas y dígitos)
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  // Genera un ID al azar
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}


function distancia(obj1, obj2) {
  return Math.sqrt(
    (obj1.pos.x - obj2.pos.x) ** 2 + (obj1.pos.y - obj2.pos.y) ** 2
  );
}

function lerp(a, b, t) {
  // Asegúrate de que t esté en el rango [0, 1]
  t = Math.max(0, Math.min(1, t));

  return a + (b - a) * t;
}
