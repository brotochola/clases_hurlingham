function calcularFuerzaGravedad(m1, m2, r) {
    const G = 6.67430e-11; // Constante de gravitación universal en m^3 kg^-1 s^-2
    return (G * m1 * m2) / (r * r);
}

function calcularDistancia(x1, y1, x2, y2) {
    const dx = x2 - x1; // Diferencia en la coordenada x
    const dy = y2 - y1; // Diferencia en la coordenada y
    return Math.sqrt(dx * dx + dy * dy); // Calcula la raíz cuadrada de la suma de los cuadrados
}
function obtenerColorAleatorioHex() {
    // Genera un número hexadecimal aleatorio entre 0x000000 y 0xFFFFFF
    const color = Math.floor(Math.random() * 0xFFFFFF);

    // Convierte el número a una cadena hexadecimal y añade el prefijo 0x
    return `0x${color.toString(16).padStart(6, '0')}`;
}


// function rebote(c1, c2) {
//     // Calcula la normal de la colisión
//     const dx = c2.x - c1.x;
//     const dy = c2.y - c1.y;
//     const distancia = Math.sqrt(dx * dx + dy * dy);
//     const nx = dx / distancia;
//     const ny = dy / distancia;

//     // Calcula la velocidad relativa
//     const v1n = (c1.velocidadX * nx + c1.velocidadY * ny);
//     const v2n = (c2.velocidadX * nx + c2.velocidadY * ny);

//     // Calcula la nueva velocidad normal
//     const v1nNueva = (v1n + v2n) / 2;
//     const v2nNueva = v1nNueva;

//     // Actualiza las velocidades
//     c1.velocidadX += v2nNueva - v1n;
//     c1.velocidadY += v2nNueva - v1n;
//     c2.velocidadX += v1nNueva - v2n;
//     c2.velocidadY += v1nNueva - v2n;
// }