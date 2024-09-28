
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


function generarNombreAleatorio() {
  const vocales = ['a', 'e', 'i', 'o', 'u'];
  const consonantes = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

  // Genera una longitud aleatoria para el nombre entre 4 y 8 caracteres.
  const longitudNombre = Math.floor(Math.random() * 7) + 4;

  let nombre = '';
  let usarConsonante = true;

  for (let i = 0; i < longitudNombre; i++) {
      if (usarConsonante) {
          nombre += consonantes[Math.floor(Math.random() * consonantes.length)];
      } else {
          nombre += vocales[Math.floor(Math.random() * vocales.length)];
      }
      usarConsonante = !usarConsonante; // Alternar entre consonante y vocal
  }

  // Capitalizar la primera letra del nombre
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

function generarColorAleatorio() {
  // Genera un número aleatorio entre 0x000000 y 0xFFFFFF
  let color = Math.floor(Math.random() * 0xffffff);
  // Convierte el número en formato hexadecimal y asegura que tenga 6 dígitos
  return `0x${color.toString(16).padStart(6, '0')}`;
}
