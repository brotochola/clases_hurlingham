function normalizeVector(vector) {
  // Calcula la magnitud del vector
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  // Si la magnitud es 0, devuelve el vector original (o maneja el caso de magnitud cero de otra manera)
  if (magnitude === 0) {
    return vector;
  }

  // Divide cada componente del vector por la magnitud
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
}


function generateRandomID(length = 8) {
    // Conjunto de caracteres alfanuméricos (mayúsculas, minúsculas y dígitos)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    // Genera un ID al azar
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

function limitMagnitude(vector, maxMagnitude) {
  // Calcular la magnitud actual del vector
  const currentMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  // Si la magnitud actual es mayor que la máxima permitida, limitar el vector
  if (currentMagnitude > maxMagnitude) {
    const scale = maxMagnitude / currentMagnitude;
    vector.x *= scale;
    vector.y *= scale;
  }

  return vector;
}

function distancia(obj1, obj2) {
  return Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
}


function lerp(a, b, t) {
    // Asegúrate de que t esté en el rango [0, 1]
    t = Math.max(0, Math.min(1, t));
    
    return a + (b - a) * t;
}