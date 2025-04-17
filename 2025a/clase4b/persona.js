class Persona extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.cargarSpritesAnimados();
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

    // spriteCaminando.anchor.set(0.5, 1);
    // spriteParado.anchor.set(0.5, 1);

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

  rebotar() {
    const margen = 120;
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
    super.update();
    // console.log("update de persona", this.id);
    //si no cargo el sprite no se ejecuta nada

    this.rebotar();
    this.noAtravesarElPiso();
  }

  render() {
    if (!this.yaCargoElSprite) return;
    super.render();
    this.cambiarVelocidadDelSpriteSegunVelocidadLineal();
    // this.cambiarDeSpriteSegunVelocidad();
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
