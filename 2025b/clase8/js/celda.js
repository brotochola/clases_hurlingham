class Celda {
  constructor(juego, anchoCelda, x, y) {
    this.anchoCelda = anchoCelda;
    this.juego = juego;
    this.entidadesAca = [];
    this.id = x + "_" + y;
    this.x = x;
    this.y = y;
    this.celdasVecinasCache = {}; // Caché indexado por cantDeCeldasParaMirar
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

  obtenerEntidadesAcaYEnCEldasVecinas(cantDeCeldasParaMirar) {
    let celdasVecinas = [];
    let entidadesCerca = [];

    celdasVecinas = this.obtenerCeldasVecinas(cantDeCeldasParaMirar) || [];
    entidadesCerca = celdasVecinas
      .map((celda) => celda && celda.entidadesAca)
      .flat()
      .filter((animal) => !!animal);

    // Agregar las entidades de la celda actual
    entidadesCerca = entidadesCerca.concat(this.entidadesAca);

    return entidadesCerca;
  }

  obtenerCeldasVecinas(cantDeCeldasParaMirar) {
    // Verificar si ya tenemos el resultado en caché para esta distancia
    if (this.celdasVecinasCache[cantDeCeldasParaMirar]) {
      return this.celdasVecinasCache[cantDeCeldasParaMirar];
    }

    let arr = [];
    for (let x = -cantDeCeldasParaMirar; x <= cantDeCeldasParaMirar; x++) {
      for (let y = -cantDeCeldasParaMirar; y <= cantDeCeldasParaMirar; y++) {
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

    // Guardar en caché antes de retornar
    this.celdasVecinasCache[cantDeCeldasParaMirar] = arr;
    return arr;
  }

  dibujar() {
    const graficoDebug = this.juego.graficoDebug;
    if (!graficoDebug) return;

    // Calcular la posición en el mundo
    const posX = this.x * this.anchoCelda;
    const posY = this.y * this.anchoCelda;

    // Color dependiendo de si hay entidades o no
    const color = this.entidadesAca.length > 0 ? 0xff0000 : 0x00ff00;
    const alpha = this.entidadesAca.length > 0 ? 0.3 : 0.1;

    // Dibujar el rectángulo de la celda
    graficoDebug.rect(posX, posY, this.anchoCelda, this.anchoCelda);
    graficoDebug.fill({ color: color, alpha: alpha });
    graficoDebug.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
  }
}
