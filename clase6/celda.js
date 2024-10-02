class Celda {
  constructor(juego, tamanoCelda, x, y) {
    this.juego = juego;
    this.entidadesAca = {};
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
    this.entidadesAca[entidad.id] = entidad;
  }

  borrar(entidad) {
    delete this.entidadesAca[entidad.id];
  }

  update() {
    this.dibujame();
  }

  obtenerCeldasVecinas() {
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

    return arrayUnique(arr);
  }



  obtenerCeldasVecinas2Niveles() {
    let arr = [];
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
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

    return arrayUnique(arr);
  }

  
  obtenerEntidadesAcaYEnLasCeldasVecinas2Niveles() {
    let celdas = [this, this.obtenerCeldasVecinas2Niveles()];

    let arrParaRetornar = [];

    for (let celda of celdas) {
      if (celda && celda.entidadesAca) {
        arrParaRetornar = [
          ...arrParaRetornar,
          ...Object.values(celda.entidadesAca),
        ];
      }
    }

    return arrParaRetornar;
  }


  obtenerEntidadesAcaYEnLasCeldasVecinas() {
    let celdas = [this, this.obtenerCeldasVecinas()];

    let arrParaRetornar = [];

    for (let celda of celdas) {
      if (celda && celda.entidadesAca) {
        arrParaRetornar = [
          ...arrParaRetornar,
          ...Object.values(celda.entidadesAca),
        ];
      }
    }

    return arrParaRetornar;
  }
}
