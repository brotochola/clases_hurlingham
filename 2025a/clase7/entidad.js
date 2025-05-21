class Entidad {
  constructor(x, y, juego) {
    this.container = new PIXI.Container();
    this.juego = juego;

    this.id = generateRandomID(8);

    this.juego.app.stage.addChild(this.container);

    this.x = x;
    this.y = y;
    this.velocidad = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };

    this.changuiMargenes = 10;
    this.fuerzaParavolverDeLosBordes = 300;
    this.celda = null;
  }

  aplicarFuerza(x, y) {
    this.acc.x += x;
    this.acc.y += y;
  }

  rebotarContraLosBoredes() {
    if (this.x < this.changuiMargenes) {
      //SI ESTOY MAS A LA IZQ Q EL MARGEN IZQ -CHANGUI
      // LA FUERZA Q SE LE APLICA ES DIRECTAMENTE PROPORCIONAL A LA DISTANCIA A LA Q ESTA

      let fuerza =
        distancia(this, { x: this.changuiMargenes, y: this.y }) *
        this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(fuerza, 0);
    } else if (this.x > window.innerWidth - this.changuiMargenes) {
      //SI ESTOY MAS A LA DER Q EL MARGEN DERECHO-CHANGUI
      let fuerza =
        distancia(this, {
          x: window.innerWidth - this.changuiMargenes,
          y: this.y,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(-fuerza, 0);
    }

    if (this.y < this.changuiMargenes) {
      //SI ESTOY MAS ARRIBA Q EL CHANGUI PARA ARRIBA
      let fuerza =
        distancia(this, {
          x: this.x,
          y: this.changuiMargenes,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(0, fuerza);
    } else if (this.y > window.innerHeight - this.changuiMargenes) {
      //ABAJO
      let fuerza =
        distancia(this, {
          x: this.x,
          y: window.innerHeight - this.changuiMargenes,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(0, -fuerza);
    }
  }

  update() {
    // if(isNaN(this.acc.x)) debugger

    this.acc = limitMagnitude(this.acc, this.accMax);
    this.velocidad.x += this.acc.x;
    this.velocidad.y += this.acc.y;

    this.acc.x = 0;
    this.acc.y = 0;

    this.velocidad = limitMagnitude(this.velocidad, this.velMax);

    // this.rebotarContraLosBoredes();

    this.x += this.velocidad.x;
    this.y += this.velocidad.y;

    this.actualizarMiPosicionEnLaGRilla();

    // this.x = (this.x + window.innerWidth) % window.innerWidth;
    // this.y = (this.y + window.innerHeight) % window.innerHeight;
  }

  actualizarMiPosicionEnLaGRilla() {
    const celdaActual = this.juego.grilla.obtenerCeldaEnPosicion(
      this.x,
      this.y
    );

    if (this.celda && celdaActual && celdaActual != this.celda) {
      this.celda.sacame(this);
      celdaActual.agregame(this);
      this.celda = celdaActual;
    } else if (!this.celda && celdaActual) {
      this.celda = celdaActual;
    }
  }

  render() {
    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x);

    this.container.rotation = this.angulo;
    this.container.x = this.x;
    this.container.y = this.y;
  }
}
