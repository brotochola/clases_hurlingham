class Celda {
  constructor(juego, anchoCelda, x, y) {
    this.juego = juego;
    this.entidadesAca = [];
    this.id = x + "_" + y;
    this.x = x;
    this.y = y;
    this.celdasVecinas = [];
  }

  agregame(quien) {
    if (!quien) return;
    this.entidadesAca.push(quien);
  }

  sacame(quien) {
    if (!quien) return;
    for (let i = 0; i < this.entidadesAca.length; i++) {
      const entidad = this.entidadesAca[i];
      if (quien.id == entidad.id) {
        this.entidadesAca.splice(i, 1);
        return;
      }
    }
  }

  obtenerEntidadesAcaYEnCEldasVecinas() {
    let celdasVecinas = [];
    let entidadesCerca = [];

    celdasVecinas = this.obtenerCeldasVecinas() || [];
    entidadesCerca = celdasVecinas
      .map((celda) => celda && celda.entidadesAca)
      .flat()
      .filter((animal) => !!animal);

    return entidadesCerca;
  }

  obtenerCeldasVecinas() {
    if (this.celdasVecinas.length > 0) return this.celdasVecinas;
    let arr = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        {
          const newX = this.x + x;
          const newY = this.y + y;

          try {
            const hash = this.juego.grilla.obtenerHashDePosicion(newX, newY);
            const celda = this.juego.grilla.celdas[hash];
            if (this != celda) arr.push(celda);
          } catch (e) {}
        }
      }
    }
    this.celdasVecinas = arr;
    return arr;
  }
}
