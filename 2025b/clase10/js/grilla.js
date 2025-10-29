class Grilla {
  constructor(juego, anchoCelda, anchoDelMapa, altoDelMapa) {
    this.juego = juego;
    this.anchoCelda = anchoCelda;

    this.celdas = {};

    // this.initGrilla();
  }
  // initGrilla() {
  //   for (let x = 0; x < this.celdaALoAncho; x++) {
  //     for (let y = 0; y < this.celdaALoAlto; y++) {
  //       const celda = new Celda(this.juego, this.anchoCelda, x, y);
  //       const hash = this.obtenerHashDePosicion(x, y);
  //       this.celdas[hash] = celda;
  //     }
  //   }
  // }

  obtenerHashDePosicion(x, y) {
    return "x_" + x + "_y_" + y;
  }

  // Obtener o crear una celda usando coordenadas de grilla (grid coordinates)
  obtenerCeldaEnCoordenadas(gridX, gridY) {
    const hash = this.obtenerHashDePosicion(gridX, gridY);
    let celda = this.celdas[hash];

    if (!celda) {
      // console.log("nueva celda", gridX, gridY);
      celda = this.celdas[hash] = new Celda(
        this.juego,
        this.anchoCelda,
        gridX,
        gridY
      );
    }

    return celda;
  }

  // Obtener o crear una celda usando posición en píxeles (pixel position)
  obtenerCeldaEnPosicion(x, y) {
    const gridX = Math.floor(x / this.anchoCelda);
    const gridY = Math.floor(y / this.anchoCelda);
    return this.obtenerCeldaEnCoordenadas(gridX, gridY);
  }

  dibujarGrilla() {
    Object.values(this.celdas).forEach((celda) => celda.dibujar());
  }
}
