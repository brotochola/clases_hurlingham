class Grilla {
  constructor(juego, anchoCelda) {
    this.juego = juego;
    this.anchoCelda = anchoCelda;
    this.celdaALoAncho = Math.ceil(this.juego.ancho / this.anchoCelda) * 2;
    this.celdaALoAlto = Math.ceil(this.juego.alto / this.anchoCelda) * 2;

    this.celdas = {};

    for (let x = 0; x < this.celdaALoAncho; x++) {
      for (let y = 0; y < this.celdaALoAlto; y++) {
        const celda = new Celda(this.juego, this.anchoCelda, x, y);
        const hash = this.obtenerHashDePosicion(x, y);
        this.celdas[hash] = celda;
      }
    }
  }

  obtenerHashDePosicion(x, y) {
    return "x_" + x + "_y_" + y;
  }

  obtenerCeldaEnPosicion(x, y) {
    const nuevaX = Math.abs(Math.floor(x / this.anchoCelda));
    const nuevaY = Math.abs(Math.floor(y / this.anchoCelda));
    const hash = this.obtenerHashDePosicion(nuevaX, nuevaY);

    const celda = this.celdas[hash];

    return celda;
  }
}
