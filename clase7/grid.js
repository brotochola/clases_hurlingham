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
    if (entidad.estoyEnLaMismaCeldaQueEnElFrameAnterior()) return;
    try {
      let gridX = Math.floor(entidad.x / this.tamanoCelda);
      let gridY = Math.floor(entidad.y / this.tamanoCelda);

      if (gridX < 0) gridX = 0;
      if (gridY < 0) gridY = 0;

      //si la entidad ya estaba en una celda, la sacamos de esa celda
      if (entidad.celda) entidad.celda.borrar(entidad);

      //buscamos la celda en la q esta ahora esta entidad
      let celda = this.celdas[gridX][gridY];
      //y le asignamos a la entidad esta celda en su propiedad homonima
      entidad.celda = celda;

      celda.agregar(entidad);
    } catch (e) {
      console.log(e);
      debugger;
    }
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
