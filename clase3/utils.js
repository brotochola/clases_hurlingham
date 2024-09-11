function getRandomColor() {
    // Genera un número aleatorio entre 0x000000 y 0xFFFFFF
    const randomColor = Math.floor(Math.random() * 0xFFFFFF);
    // Convierte el número a una cadena hexadecimal y lo rellena con ceros a la izquierda
    const hexColor = randomColor.toString(16).padStart(6, '0');
    // Devuelve el color en formato 0xRRGGBB
    return `0x${hexColor.toUpperCase()}`;
}


function isOverlap(rect1, rect2) {
    // Extraer las coordenadas y dimensiones de cada rectángulo
    const { x: x1, y: y1, ancho: w1, alto: h1 } = rect1;
    const { x: x2, y: y2, ancho: w2, alto: h2 } = rect2;
    
    // Calcular las coordenadas de las esquinas de cada rectángulo
    const rect1Left = x1 - w1 / 2;
    const rect1Right = x1 + w1 / 2;
    const rect1Top = y1;
    const rect1Bottom = y1 + h1;
    
    const rect2Left = x2 - w2 / 2;
    const rect2Right = x2 + w2 / 2;
    const rect2Top = y2;
    const rect2Bottom = y2 + h2;
    
    // Determinar si hay solapamiento
    const isOverlapping = rect1Left < rect2Right &&
                          rect1Right > rect2Left &&
                          rect1Top < rect2Bottom &&
                          rect1Bottom > rect2Top;
    
    return isOverlapping;
}
