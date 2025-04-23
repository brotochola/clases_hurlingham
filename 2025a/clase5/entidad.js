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
    this.accMax = 0.1;

    this.valorFriccion = 0.93;

    this.spritesAnimados = {};
    this.crearContainer();
  }

  crearContainer() {
    this.container = new PIXI.Container();
    this.container.interactive = true;
    this.container.on("pointerdown", (e) => {
      console.log("click en", this);
    });

    this.juego.containerPrincipal.addChild(this.container);
  }

  aplicarAceleracion(x, y) {
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

    this.limitarAceleracion();

    // this.aplicarGravedad();

    // this.asignarFuerzaQueMeLlevaAlMouse();

    //sumamos la aceleracion a la velocidad
    this.velX += this.accX;
    this.velY += this.accY;

    this.limitarVelocidad();

    // this.limitarVelocidad();

    this.frenarSiVoyMuyLento();

    this.aplicarFriccion();

    //sumamos la vleocidad a la posicion
    this.x += this.velX;
    this.y += this.velY;

    this.accX = 0;
    this.accY = 0;
  }

  limitarAceleracion() {
    let aceleracionLineal = Math.sqrt(this.accX ** 2 + this.accY ** 2);
    if (aceleracionLineal > this.accMax) {
      // Normalizamos el vector de aceleración
      const factor = this.accMax / aceleracionLineal;

      // Aplicamos el factor para limitar la aceleración
      this.accX *= factor;
      this.accY *= factor;
    }
  }

  asignarFuerzaQueMeLlevaAlMouse() {
    const vectorNormalizadoQueApuntaAlMouse = getUnitVector(
      this.x,
      this.y,
      this.juego.mouse.x,
      this.juego.mouse.y
    );

    this.aplicarAceleracion(
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
    this.velX *= this.valorFriccion;
    this.velY *= this.valorFriccion;
  }

  noAtravesarElPiso() {
    if (this.y > this.juego.alto) {
      this.y = this.juego.alto;
    }
  }

  aplicarGravedad() {
    this.aplicarAceleracion(this.juego.gravedad.x, this.juego.gravedad.y);
  }

  limitarVelocidad() {
    // Calcular la magnitud de la velocidad actual (velocidad lineal)
    const velocidadActual = Math.sqrt(
      this.velX * this.velX + this.velY * this.velY
    );

    // Solo aplicar limitación si excede la velocidad máxima
    if (velocidadActual > this.velocidadMaxima) {
      // Factor de escala para reducir proporcionalmente ambas componentes
      const factor = this.velocidadMaxima / velocidadActual;

      // Ajustar ambas componentes de manera proporcional
      this.velX *= factor;
      this.velY *= factor;
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
