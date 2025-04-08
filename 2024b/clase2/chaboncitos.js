class Chaboncito {
  constructor(x, y, app, i, juego) {
    this.juego = juego;
    this.i = i;
    this.app = app;
    this.x = x;
    this.y = y;

    this.velocidadX = 1 + Math.random();
    this.velocidadY = 1 + Math.random();

    this.aceleracionX = 0;
    this.aceleracionY = 0;

    this.listo = false;

    this.cargarSpriteAnimado();

    // this.graphics = new PIXI.Graphics()
    //     .circle(this.x, this.y,  10)
    //     .fill(0xff0000);

    // //EMPIEZA LA CARGA DE 1.PNG
    // const texture = PIXI.Assets.load('./1.png').then(e => {

    //     //investigar "arro functions de js"
    //     // ()=>{}
    //     // function(){}

    //     //TERMINO LA CARGA DE 1.PNG
    //     //GENERAMOS UN SPRITE CON LA IMAGEN

    //     this.sprite = PIXI.Sprite.from(e)

    //     //Y LA AGREGAMOS AL STAGE
    //     app.stage.addChild(this.sprite)
    //     this.listo = true

    // })
  }

  async cargarSpriteAnimado() {
    let json = await PIXI.Assets.load("texture.json");
    this.sprite = new PIXI.AnimatedSprite(json.animations["corriendo"]);
    this.sprite.animationSpeed = 0.1;
    this.sprite.loop = true;
    this.sprite.play();
    this.app.stage.addChild(this.sprite);

    this.sprite.anchor.set(0.5, 1);
    this.sprite.currentFrame = Math.floor(Math.random() * 8);

    this.listo = true;
  }
  update(time) {
    if (!this.listo) return;

    this.time = time;

    //ACELERACION
    this.velocidadX += this.aceleracionX;
    this.velocidadY += this.aceleracionY;

    this.aceleracionX = 0;
    this.aceleracionY = 0;

    //APLICAR LA VELOCIDAD SOBRE LA POSICION
    this.x += this.velocidadX;
    this.y += this.velocidadY;

    //friccion
    // this.velocidadX *= 0.98
    // this.velocidadY *= 0.98

    this.cambiarOrdenEnZ();

    this.evaluarSiLlegueAlLimiteDeLaPantalla();
    // this.cuandoLlegaAlMArgenAparecePorElOtroLado();

    this.manejarDireccionDelSprite();
    this.cambiarVelocidadDeReproduccionDelSpriteAnimado();

    //APLICAR X E Y A LA POSICION DEL GRAFICO EN EL STAGE DE PIXI
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
  cambiarVelocidadDeReproduccionDelSpriteAnimado() {
    this.sprite.animationSpeed = Math.abs(this.velocidadX) * 0.1;
  }
  manejarDireccionDelSprite() {
    if (this.velocidadX > 0) {
      this.sprite.scale.x = 1;
    } else if (this.velocidadX < 0) {
      this.sprite.scale.x = -1;
    }
  }

  cambiarOrdenEnZ() {
    this.sprite.zIndex = this.y;
  }

  cuandoLlegaAlMArgenAparecePorElOtroLado() {
    this.x = this.x % this.juego.ancho;
    this.y = this.y % this.juego.alto;
  }

  evaluarSiLlegueAlLimiteDeLaPantalla() {
    let margen = 0;
    if (this.x > this.juego.ancho - margen) {
      //margen derecho
      this.velocidadX = -Math.abs(this.velocidadX);
    } else if (this.x < margen) {
      //margen izq
      this.velocidadX = Math.abs(this.velocidadX);
    }

    //EN Y
    if (this.y > this.juego.alto - margen) {
      //margen derecho
      this.velocidadY = -Math.abs(this.velocidadY);
    } else if (this.y < margen) {
      //margen izq
      this.velocidadY = Math.abs(this.velocidadY);
    }
  }

  aplicarAceleracion(x, y) {
    this.aceleracionX = x;
    this.aceleracionY = y;
  }
}
