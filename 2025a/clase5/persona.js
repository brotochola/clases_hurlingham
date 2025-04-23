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
    //cargo el json
    let json = await PIXI.Assets.load("texture.json");

    //recorro todas las animaciones q tiene
    for (let animacion of Object.keys(json.animations)) {
      //cada animacion ahora esta en la variable animacion:
      //en el objeto spritesAnimados, creo q una propiedad/valor nuevo, con el nombre de la animacion, y le meto una nueva instancia de PIXI.animatedSprite
      this.spritesAnimados[animacion] = new PIXI.AnimatedSprite(
        json.animations[animacion]
      );

      //q loopee
      this.spritesAnimados[animacion].loop = true;
      //y le damos play
      this.spritesAnimados[animacion].play();
      //lo metemos en el container de esta entidad/persona
      this.container.addChild(this.spritesAnimados[animacion]);

      //el punto de anclaje abajo al medio (donde el chabon toca el piso, pq este punto lo usamos para ver quien esta adelante y quien esta atras)
      this.spritesAnimados[animacion].anchor.set(0.5, 1);
      //el frame inicial q sea random
      this.spritesAnimados[animacion].currentFrame = Math.floor(
        this.spritesAnimados[animacion].totalFrames * Math.random()
      );
    }

    this.cambiarDeSpriteSegunVelocidad();

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

  render() {
    if (!this.yaCargoElSprite) return;
    super.render();
    this.cambiarVelocidadDelSpriteSegunVelocidadLineal();
    this.cambiarDeSpriteSegunVelocidad();
  }

  cambiarDeSpriteSegunVelocidad() {
    if (this.calcularVelocidadLineal() > 0) {
      this.cambiarSpriteAnimado("caminar");
    } else {
      this.cambiarSpriteAnimado("parado");
    }
  }
  cambiarVelocidadDelSpriteSegunVelocidadLineal() {
    this.sprite.animationSpeed = this.calcularVelocidadLineal() * 0.13;
  }
}
