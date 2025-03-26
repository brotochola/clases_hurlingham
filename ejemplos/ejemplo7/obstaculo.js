class Obstaculo {
  constructor(x, y, app, i, juego) {
    this.juego = juego;
    this.i = i;
    this.app = app;
    this.x = x;
    this.y = y;

    this.color = obtenerColorAleatorioHex();

    this.velocidadX = 0;
    this.velocidadY = 0;
    this.aceleracionY = 0;
    this.aceleracionX = 0;
    this.ancho = 10 + Math.random() * 50;
    this.alto = 10 + Math.random() *50;
    this.masa = this.radio * 100000;

    this.listo = false;

    // this.cargarSpriteAnimado();
    this.ponerRectangulo();
    // this.ponerImagen();
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

      this.sprite.tint = obtenerColorAleatorioHex();
      this.listo = true;
    });
  }
  ponerRectangulo() {
    this.sprite = new PIXI.Graphics()
      .rect(0, 0, this.ancho, this.alto)
      .fill(this.color);
    this.sprite.pivot.set(this.ancho * 0.5, this.alto);
    this.juego.app.stage.addChild(this.sprite);
    this.listo = true;
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
  gravedad() {
    this.aceleracionY += 1.6;
  }
  moverSegunTeclado() {
    let delta = 0.6;
    if (this.juego.teclado.a) {
      this.aceleracionX -= delta;
    } else if (this.juego.teclado.d) {
      this.aceleracionX += delta;
    } else if (this.juego.teclado.w) {
    }
  }

  noPasarPorObstaculos() {
    for (let i = 0; i < this.juego.obstaculos.length; i++) {
      let obs = this.juego.obstaculos[i];
      // console.log(this.y < obs.y - obs.lado && this.velocidadY > 0);

      if (
        rectangulosSeSolapan(
          { ...this, y: this.y + this.velocidadY, x: this.x + this.velocidadX },
          obs
        )
      ) {
        if (this.y < obs.y - obs.alto && this.velocidadY > 0) {
          // console.log("chocando desde arriba");
          this.velocidadY = 0;
          this.llegueAlPiso = true;
          // obs.aceleracionY++
        } else if (this.y > obs.y && this.velocidadY < 0) {
          // console.log("chocando desde abajo");
          this.velocidadY = 0;
          // obs.aceleracionY--
        } else if (this.x < obs.x - obs.ancho / 2 && this.velocidadX > 0) {
          // console.log("chocando desde izq");
          obs.velocidadX++
          this.velocidadX = 0;
        } else if (this.x > obs.x + obs.ancho / 2 && this.velocidadX < 0) {
          this.velocidadX = 0;
          obs.velocidadX--
          // console.log("chocando desde der");
        }
      }
    }
  }

  update(time) {
    if (!this.listo) return;

    this.time = time;

    // this.separacion();
    // this.seguirMouse();

    this.gravedad();

    //aplicar aceleracion a la velocidad
    this.velocidadX += this.aceleracionX;
    this.velocidadY += this.aceleracionY;

    this.aceleracionX = 0;
    this.aceleracionY = 0;

    this.noPasarPorObstaculos();

    //APLICAR LA VELOCIDAD SOBRE LA POSICION
    this.x += this.velocidadX;
    this.y += this.velocidadY;

    //friccion
    this.velocidadX *= 0.9
    this.velocidadY *= 0.9

    this.mantenerLaVelocidadPorDebajoDeLaMax();

    // this.cambiarOrdenEnZ();

    this.evaluarSiLlegueAlLimiteDeLaPantalla();
    // this.cuandoLlegaAlMArgenAparecePorElOtroLado();

    // this.manejarDireccionDelSprite();
    // this.cambiarVelocidadDeReproduccionDelSpriteAnimado();

    //APLICAR X E Y A LA POSICION DEL GRAFICO EN EL STAGE DE PIXI
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  mantenerLaVelocidadPorDebajoDeLaMax() {
    let velMax = 15;
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

  evaluarSiLlegueAlLimiteDeLaPantalla() {
    let margen = 10;
    // if (this.x > this.juego.ancho - margen) {
    //   //margen derecho
    //   this.velocidadX = -Math.abs(this.velocidadX);
    // } else if (this.x < margen) {
    //   //margen izq
    //   this.velocidadX = Math.abs(this.velocidadX);
    // }

    //EN Y
    // if (this.y > this.juego.alto - margen) {
    //   //margen derecho
    //   this.aceleracionY = 9.8;
    // }

    if (this.y > this.juego.alto - margen) {
      this.y = this.juego.alto - margen;
    }
  }

  aplicarAceleracion(x, y) {
    this.aceleracionX = x;
    this.aceleracionY = y;
  }
}
