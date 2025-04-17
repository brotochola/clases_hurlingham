class Entidad {
  constructor(x, y, juego) {
    this.juego = juego;
    this.id = Math.floor(Math.random() * 9999999);
    this.x = x;
    this.y = y;

    this.velX = 0;
    this.velY = 0;

    this.accX = 0;
    this.accY = 0;

    this.velocidadMaxima = 6;
    this.aceleracionMAxima = 1.3;

    this.spritesAnimados = {};
    this.crearContainer();
  }

  crearContainer() {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.container.on("pointerdown", (e) => {
      console.log("click en", this);
    });

    this.juego.app.stage.addChild(this.container);
  }

  asignarAceleracion(x, y) {
    this.accX += x;
    this.accY += y;
  }

  asignarVelocidad(x, y) {
    this.velX = x;
    this.velY = y;
  }

  update() {
    // console.log("update de persona", this.id);
    //si no cargo el sprite no se ejecuta nada
    if (!this.yaCargoElSprite) return;

    // this.aplicarGravedad();

    // this.asignarFuerzaQueMeLlevaAlMouse();

    //sumamos la aceleracion a la velocidad
    this.velX += this.accX;
    this.velY += this.accY;

    // this.limitarVelocidad();

    this.frenarSiVoyMuyLento();

    this.aplicarFriccion();

    //sumamos la vleocidad a la posicion
    this.x += this.velX;
    this.y += this.velY;

    this.accX = 0;
    this.accY = 0;
  }

  asignarFuerzaQueMeLlevaAlMouse() {
    const vectorNormalizadoQueApuntaAlMouse = getUnitVector(
      this.x,
      this.y,
      this.juego.mouse.x,
      this.juego.mouse.y
    );

    this.asignarAceleracion(
      vectorNormalizadoQueApuntaAlMouse.x * 0.5,
      vectorNormalizadoQueApuntaAlMouse.y * 0.5
    );
  }

  frenarSiVoyMuyLento() {
    if (this.velX < 0.1 && this.velX > -0.1) {
      this.velX = 0;
    }
    if (this.velY < 0.1 && this.velY > -0.1) {
      this.velY = 0;
    }
  }

  aplicarFriccion() {
    this.velX *= 0.93;
    this.velY *= 0.93;
  }

  noAtravesarElPiso() {
    if (this.y > this.juego.alto) {
      this.y = this.juego.alto;
    }
  }

  aplicarGravedad() {
    this.asignarAceleracion(this.juego.gravedad.x, this.juego.gravedad.y);
  }

  limitarVelocidad() {
    if (Math.abs(this.velX) > this.velocidadMaxima) {
      let coeficiente = 1;
      if (this.velX < 0) coeficiente = -1;
      this.velX = this.velocidadMaxima * coeficiente;
    }

    if (Math.abs(this.velY) > this.velocidadMaxima) {
      let coeficiente = 1;
      if (this.velY < 0) coeficiente = -1;
      this.velY = this.velocidadMaxima * coeficiente;
    }
  }

  calcularVelocidadLineal() {
    return Math.sqrt(this.velX * this.velX + this.velY * this.velY);
  }

  render() {
    if (this.muerta) return;
    if (!this.yaCargoElSprite) return;

    this.container.x = this.x;
    this.container.y = this.y;

    if (this.velX < 0) {
      this.sprite.scale.x = -1;
    } else {
      this.sprite.scale.x = 1;
    }

    this.container.zIndex = Math.floor(this.y);
  }
}
