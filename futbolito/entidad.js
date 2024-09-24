class Entidad {
  constructor(x, y, juego) {
    this.container = new PIXI.Container();
    this.crearContainerDebug();

    this.juego = juego;

    this.id = generateRandomID(8);

    this.juego.app.stage.addChild(this.container);

    this.pos = new Vector(x, y);

    this.velocidad = new Vector(0, 0);
    this.acc = new Vector(0, 0);

    this.changuiMargenes = 10;
    this.fuerzaParavolverDeLosBordes = 300;
  }

  crearContainerDebug() {
    this.containerDebug = new PIXI.Container();
    this.containerDebug.visible = false;

    this.container.addChild(this.containerDebug);
  }

  aplicarFuerza(x, y) {
    this.acc.x += x;
    this.acc.y += y;
  }

  crearGraficoParaIndicarQueEstaEntidadEStaSeleccionada() {
    let borde = 4;
    this.graficoDebug = new PIXI.Graphics()
      .rect(-borde, -borde, this.lado + borde * 2, this.lado / 2 + borde * 2)
      .fill(0xffffff);
    this.containerDebug.addChild(this.graficoDebug);
  }

  rebotarContraLosBordes() {
    let fuerzaX=0
    let fuerzaY=0
    if (this.pos.x < this.changuiMargenes) {
      //SI ESTOY MAS A LA IZQ Q EL MARGEN IZQ -CHANGUI
      // LA FUERZA Q SE LE APLICA ES DIRECTAMENTE PROPORCIONAL A LA DISTANCIA A LA Q ESTA
      fuerzaX=-this.velocidad.x
    } else if (this.pos.x > this.juego.ancho - this.changuiMargenes) {
      fuerzaX=-this.velocidad.x 
    }

    if (this.pos.y < this.changuiMargenes) {
      fuerzaY=-this.velocidad.y
    } else if (this.pos.y > this.juego.alto - this.changuiMargenes) {
      fuerzaY=-this.velocidad.y
    }

    this.aplicarFuerza(fuerzaX*2, fuerzaY*2);


  }

  update() {
    // if(isNaN(this.acc.x)) debugger

    this.acc.limit(this.accMax);
    this.velocidad.add(this.acc);

    this.acc.setMag(0);

    this.velocidad.limit(this.velMax);

    // this.rebotarContraLosBoredes();

    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x);

    this.pos.add(this.velocidad);

    // this.pos.x = (this.pos.x + this.juego.ancho) % this.juego.ancho;
    // this.pos.y = (this.pos.y + this.juego.alto) % this.juego.alto;
  }

  render() {
    this.containerDebug.visible = this.debug;
    this.container.zIndex = this.pos.y;
    this.container.rotation = this.angulo;
    this.container.x = this.pos.x;
    this.container.y = this.pos.y;
  }
}
