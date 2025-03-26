class Celda {
  constructor(juego, tamanoCelda, x, y) {
    this.juego = juego;
    this.entidadesAca = [];
    this.x = x;
    this.y = y;
    this.tamanoCelda = tamanoCelda;
  }

  dibujame() {
    this.juego.dibujador
      .rect(
        this.x * this.tamanoCelda,
        this.y * this.tamanoCelda,
        this.tamanoCelda,
        this.tamanoCelda
      )
      .stroke();
  }

  agregar(entidad) {
    this.entidadesAca.push(entidad);
  }

  borrar(entidad) {
    this.entidadesAca = this.entidadesAca.filter((k) => k.id != entidad.id);
  }

  update() {
    // this.dibujame();
  }

  obtenerCeldasVecinas() {
    if (this.celdasVecinas) return this.celdasVecinas;
    let arr = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        // console.log(this,this.x + i, this.y + j);
        if (i == 0 && j == 0) continue;

        let indiceX = this.x + i;
        if (indiceX < 0) indiceX = 0;
        else if (indiceX > this.juego.grid.celdas.length - 1)
          indiceX = this.juego.grid.celdas.length;

        let indiceY = this.y + j;
        if (indiceY < 0) indiceY = 0;
        else if (indiceY > this.juego.grid.celdas[indiceX].length - 1)
          indiceY = this.juego.grid.celdas[indiceX].length;

        let celda = this.juego.grid.celdas[indiceX][indiceY];
        // debugger
        arr.push(celda);
      }
    }
    this.celdasVecinas = arrayUnique(arr);
    return this.celdasVecinas;
  }
  // obtenerCeldasVecinas2Niveles() {
  //   if (this.celdasVecinasA2Niveles) return this.celdasVecinasA2Niveles;
  //   let arr = [];
  //   for (let i = -2; i <= 2; i++) {
  //     for (let j = -2; j <= 2; j++) {
  //       // console.log(this,this.x + i, this.y + j);
  //       if (i == 0 && j == 0) continue;

  //       let indiceX = this.x + i;
  //       if (indiceX < 0) indiceX = 0;
  //       else if (indiceX > this.juego.grid.celdas.length - 1)
  //         indiceX = this.juego.grid.celdas.length;

  //       let indiceY = this.y + j;
  //       if (indiceY < 0) indiceY = 0;
  //       else if (indiceY > this.juego.grid.celdas[indiceX].length - 1)
  //         indiceY = this.juego.grid.celdas[indiceX].length;

  //       let celda = this.juego.grid.celdas[indiceX][indiceY];
  //       // debugger
  //       arr.push(celda);
  //     }
  //   }
  //   this.celdasVecinasA2Niveles = arrayUnique(arr);
  //   return this.celdasVecinasA2Niveles;
  // }

  // obtenerEntidadesAcaYEnLasCeldasVecinas2Niveles() {
  //   let arrParaRetornar = [...this.entidadesAca];

  //   for (let celda of this.obtenerCeldasVecinas2Niveles()) {
  //     if (celda && celda.entidadesAca) {
  //       arrParaRetornar = [...arrParaRetornar, ...celda.entidadesAca];
  //     }
  //   }

  //   return arrParaRetornar;
  // }

  obtenerEntidadesAcaYEnLasCeldasVecinas() {
    let arrParaRetornar = [...this.entidadesAca];

    for (let celda of this.obtenerCeldasVecinas()) {
      if (celda && celda.entidadesAca) {
        arrParaRetornar = [...arrParaRetornar, ...celda.entidadesAca];
      }
    }

    return mezclarArray(arrParaRetornar);
  }
}
