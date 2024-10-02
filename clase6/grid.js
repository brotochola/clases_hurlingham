class Grid {
  constructor(juego, tamanoCelda) {
    this.tamanoCelda = tamanoCelda;
    this.juego = juego;

    this.cantidadDeCeldasDeMasParaAgregarHaciaDerYAbajo = 50;

    this.cantidadDeCeldasALoAncho =
      Math.floor(this.juego.ancho / this.tamanoCelda) + 1;

    this.cantidadDeCeldasALoAlto =
      Math.floor(this.juego.alto / this.tamanoCelda) + 1;

    this.celdas = [];
    for (
      let i = 0;
      i <
      this.cantidadDeCeldasALoAncho +
        this.cantidadDeCeldasDeMasParaAgregarHaciaDerYAbajo;
      i++
    ) {
      this.celdas.push([]);

      for (
        let j = 0;
        j <
        this.cantidadDeCeldasALoAlto +
          this.cantidadDeCeldasDeMasParaAgregarHaciaDerYAbajo;
        j++
      ) {
        this.celdas[i][j] = new Celda(this.juego, this.tamanoCelda, i, j);
      }
    }
  }

  actualizarPosicionDeEntidad(entidad) {
    let gridX = Math.floor(entidad.x / this.tamanoCelda);
    let gridY = Math.floor(entidad.y / this.tamanoCelda);

    let gridXAnterior = Math.floor(entidad.xAnterior / this.tamanoCelda);
    let gridYAnterior = Math.floor(entidad.yAnterior / this.tamanoCelda);

    if (
      (isNaN(entidad.xAnterior) || isNaN(entidad.yAnterior)) &&
      gridX == gridXAnterior &&
      gridY == gridYAnterior
    ) {
      return;
    }

    if (gridX < 0) gridX = 0;
    if (gridY < 0) gridY = 0;

    //si la entidad ya estaba en una celda, la sacamos de esa celda
    if (entidad.celda) entidad.celda.borrar(entidad);

    //buscamos la celda en la q esta ahora esta entidad
    let celda = this.celdas[gridX][gridY];
    //y le asignamos a la entidad esta celda en su propiedad homonima
    entidad.celda = celda;

    celda.agregar(entidad);
  }

  update() {
    for (
      let i = 0;
      i <
      this.cantidadDeCeldasALoAncho +
        this.cantidadDeCeldasDeMasParaAgregarHaciaDerYAbajo;
      i++
    ) {
      //   this.celdas.push([]);

      for (
        let j = 0;
        j <
        this.cantidadDeCeldasALoAlto +
          this.cantidadDeCeldasDeMasParaAgregarHaciaDerYAbajo;
        j++
      ) {
        if (this.celdas[i][j]) {
          this.celdas[i][j].update();
        }
      }
    }
  }
}
