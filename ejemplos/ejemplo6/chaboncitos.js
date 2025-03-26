class Chaboncito {
  constructor(x, y, app, i, juego) {
    this.juego = juego;
    this.i = i;
    this.app = app;
    this.x = x;
    this.y = y;

    this.color = obtenerColorAleatorioHex();

    this.velocidadX = Math.random() - 0.5;
    this.velocidadY = Math.random() - 0.5;

    this.aceleracionX = 0;
    this.radio = 5 + Math.random() * 5;
    this.masa = this.radio * 100000;
    this.aceleracionY = 0;

    this.velMax = 1 + Math.random() ;

    this.listo = false;

    // this.cargarSpriteAnimado();
    // this.ponerCirculo();
    this.ponerImagen();
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

  ponerImagen() {
    PIXI.Assets.load("blur.png").then((e) => {
      this.sprite = PIXI.Sprite.from("blur.png");
      this.juego.app.stage.addChild(this.sprite);
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.alpha = 0.1;
      this.sprite.scale.set(1);
      // this.sprite.tint=obtenerColorAleatorioHex()
      this.listo = true;
    });
  }
  ponerCirculo() {
    this.sprite = new PIXI.Graphics().circle(0, 0, this.radio).fill(this.color);
    this.juego.app.stage.addChild(this.sprite);
    this.listo = true;
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

  seguirMouse() {
    let x = this.x - this.juego.mouse.x;
    let y = this.y - this.juego.mouse.y;
    this.aceleracionX -= x * 0.01 * this.velMax;
    this.aceleracionY -= y * 0.01 * this.velMax;
  }

  separacion() {
    let fuerza = { x: 0, y: 0 };
    for (let i = 0; i < this.juego.chaboncitos.length; i++) {
      let otro = this.juego.chaboncitos[i];
      if (this == otro) continue;
      let distancia = calcularDistancia(
        this.x + this.velocidadX,
        this.y + this.velocidadY,
        otro.x + otro.velocidadX,
        otro.y + otro.velocidadY
      );
      if (distancia < this.radio + otro.radio) {
        let x = this.x - otro.x;
        let y = this.y - otro.y;

        fuerza.x += x * 0.1;
        fuerza.y += y * 0.1;
      }
    }
    this.aceleracionX += fuerza.x;
    this.aceleracionY += fuerza.y;
    // this.aplicarAceleracion(fuerza.x, fuerza.y);
  }

  matar() {
    for (let i = 0; i < this.juego.chaboncitos.length; i++) {
      if (this.juego.chaboncitos[i] == this) {
        this.listo = false;
        this.juego.chaboncitos.splice(i, 1);
        this.juego.app.stage.removeChild(this.sprite);
        return;
      }
    }
  }
  update(time) {
    if (!this.listo) return;

    this.time = time;

    this.separacion();
    this.seguirMouse();

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

    this.mantenerLaVelocidadPorDebajoDeLaMax();

    // this.cambiarOrdenEnZ();

    // this.evaluarSiLlegueAlLimiteDeLaPantalla()
    this.cuandoLlegaAlMArgenAparecePorElOtroLado();

    // this.manejarDireccionDelSprite();
    // this.cambiarVelocidadDeReproduccionDelSpriteAnimado();

    //APLICAR X E Y A LA POSICION DEL GRAFICO EN EL STAGE DE PIXI
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  mantenerLaVelocidadPorDebajoDeLaMax() {
    let velMax = 3;
    if (Math.abs(this.velocidadX) > velMax) {
      this.velocidadX = this.velocidadX > 0 ? velMax : -velMax;
    }
    if (Math.abs(this.velocidadY) > velMax) {
      this.velocidadY = this.velocidadY > 0 ? velMax : -velMax;
    }
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
    this.x =
      ((this.x % this.juego.ancho) + this.juego.ancho) % this.juego.ancho;
    this.y = ((this.y % this.juego.alto) + this.juego.alto) % this.juego.alto;
  }

  //   evaluarSiLlegueAlLimiteDeLaPantalla() {
  //     let margen = 100;
  //     if (this.x > this.juego.ancho - margen) {
  //       //margen derecho
  //       this.velocidadX = -Math.abs(this.velocidadX);
  //     } else if (this.x < margen) {
  //       //margen izq
  //       this.velocidadX = Math.abs(this.velocidadX);
  //     }

  //     //EN Y
  //     if (this.y > this.juego.alto - margen) {
  //       //margen derecho
  //       this.velocidadY = -Math.abs(this.velocidadY);
  //     } else if (this.y < margen) {
  //       //margen izq
  //       this.velocidadY = Math.abs(this.velocidadY);
  //     }
  //   }

  aplicarAceleracion(x, y) {
    this.aceleracionX = x;
    this.aceleracionY = y;
  }
}
