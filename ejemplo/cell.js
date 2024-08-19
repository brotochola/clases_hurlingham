class Cell {
  constructor(x, y, juego) {
    this.x = x;
    this.y = y;
    this.juego = juego;

    this.objetosAca = {};
  }
  agregar(obj) {
    this.objetosAca[obj.id] = obj;
    obj.miCeldaActual = this;
  }
  sacar(obj) {
    obj.miCeldaActual = null;
    delete this.objetosAca[obj.id];
  }
  cuantosObjetos() {
    return Object.keys(this.objetosAca).length;
  }
  actualizarSiEsPasableONo() {
    //ESTO ES UN EXPERIMENTO
    //SI HAY MAS DE 6 PERSONAS EN ESTA CELDA, NO SE PUEDE PASAR
    // Y DEBERIA GENERAR UN VECTOR DE FUERZA Q REPELA
    if (this.cuantosObjetos() > 2) {
      this.pasable = false;
    } else {
      this.pasable = true;
    }
  }

  obtenerCeldasVecinas() {
    let vecinos = [];

    const margen = 1;
    // Revisar celdas adyacentes
    for (let i = this.x - margen; i <= this.x + margen; i++) {
      for (let j = this.y - margen; j <= this.y + margen; j++) {
        const cell = this.juego.grid.getCell(i, j);

        if (cell && cell != this) {
          vecinos.push(cell);
        }
      }
    }
    return vecinos;
  }
}
