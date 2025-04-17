class Persona {
  constructor(x, y, juego) {
    this.juego = juego;
    this.id = Math.floor(Math.random() * 9999999);
    this.x = x;
    this.y = y;

    this.velX = 0;
    this.velY = 0;

    this.accX = 0;
    this.accY = 0;

    this.velocidadMaxima = 10;
    this.aceleracionMAxima = 2;

    this.spritesAnimados = {};
    this.crearContainer();

    this.cargarSpritesAnimados();
  }

  crearContainer() {
    this.container = new PIXI.Container();

    this.juego.app.stage.addChild(this.container);
  }

  cambiarSpriteAnimado(key) {
    this.spriteSeleccionado = key;
    //extraemos las keys del objeto spritesAnimados
    const keys = Object.keys(this.spritesAnimados);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.spritesAnimados[key].visible = false;
    }

    this.sprite = this.spritesAnimados[key];
    this.sprite.visible = true;
  }

  async cargarSpritesAnimados() {
    let json = await PIXI.Assets.load("texture.json");

    const spriteCaminando = new PIXI.AnimatedSprite(json.animations["caminar"]);
    const spriteParado = new PIXI.AnimatedSprite(json.animations["parado"]);

    this.spritesAnimados["parado"] = spriteParado;
    this.spritesAnimados["caminar"] = spriteCaminando;

    this.sprite = spriteCaminando;

    spriteCaminando.animationSpeed = 0.1;
    spriteCaminando.loop = true;
    spriteCaminando.play();

    // spriteCaminando.x = this.x;
    // spriteCaminando.y = this.y;

    this.container.addChild(spriteCaminando);

    spriteCaminando.anchor.set(0.5, 1);
    spriteCaminando.currentFrame = Math.floor(Math.random() * 8);
    this.yaCargoElSprite = true;
  }

  asignarAceleracion(x, y) {
    this.accX += x;
    this.accY += y;
  }

  asignarVelocidad(x, y) {
    this.velX = x;
    this.velY = y;
  }

  rebotar() {
    const margen = 50;
    const ancho = this.juego.ancho;
    const alto = this.juego.alto;

    if (this.x > ancho - margen || this.x < margen) {
      this.velX *= -0.99;
    }

    if (this.y > alto - margen || this.y < margen) {
      this.velY *= -0.99;
    }
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

    this.rebotar();
    this.noAtravesarElPiso();
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
    // this.cambiarDeSpriteSegunVelocidad();
    this.cambiarVelocidadDelSpriteSegunVelocidadLineal();
  }

  cambiarDeSpriteSegunVelocidad() {
    if (this.calcularVelocidadLineal() < 0) {
      this.cambiarSpriteAnimado("caminar");
    } else {
      this.cambiarSpriteAnimado("parado");
    }
  }
  cambiarVelocidadDelSpriteSegunVelocidadLineal() {
    this.sprite.animationSpeed = this.calcularVelocidadLineal() * 0.2;
  }
}
