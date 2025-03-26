class Chaboncito {
  constructor(x, y, app, i, juego) {
    this.juego = juego;
    this.nombre = generarNombreAleatorio();
    this.id = Math.floor(Math.random() * 99999999);
    this.i = i;
    this.app = app;
    this.x = x;
    this.y = y;
    this.ancho = 8;
    this.alto = 70;

    this.vida = 20;

    this.color = obtenerColorAleatorioHex();

    this.radio = 5 + Math.random() * 5;
    this.masa = this.radio * 100000;

    this.listo = false;

    this.cargarSpriteAnimado();
    this.ponerCajitaDeMatterJS();
    // this.ponerRectangulo();
    // this.ponerCirculo();
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

  actualizarZIndex() {
    this.sprite.zIndex = Math.floor(this.sprite.y);
  }

  colisionCon(quien) {
    // console.log("chabo colisionó con ", quien);
    if (quien == this.juego.player) {
      this.vida -= quien.caja.velocity.x + quien.caja.velocity.y;
      Matter.Body.setVelocity(this.caja, {
        x: quien.caja.velocity.x * (0.2 + 0.2 * Math.random()),
        y: quien.caja.velocity.y * (0.2 + 0.2 * Math.random()),
      });
    }
  }

  ponerCajitaDeMatterJS() {
    this.caja = Matter.Bodies.circle(this.x, this.y, this.ancho);
    this.caja.yo = this;

    // add all of the bodies to the world
    Matter.Composite.add(this.juego.engine.world, [this.caja]);
  }

  ponerImagen() {
    PIXI.Assets.load("blur.png").then((e) => {
      this.sprite = PIXI.Sprite.from("blur.png");
      this.juego.app.stage.addChild(this.sprite);

      this.sprite.tint = obtenerColorAleatorioHex();
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
    this.sprite.scale.set(0.66);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.currentFrame = Math.floor(Math.random() * 8);

    this.listo = true;
  }

  seguirMouse() {
    let x = this.x - this.juego.mouse.x;
    let y = this.y - this.juego.mouse.y;
    this.aceleracionX -= x * 0.01;
    this.aceleracionY -= y * 0.01;
  }

  // separacion() {
  //   let fuerza = { x: 0, y: 0 };
  //   for (let i = 0; i < this.juego.chaboncitos.length; i++) {
  //     let otro = this.juego.chaboncitos[i];
  //     if (this == otro) continue;
  //     let distancia = calcularDistancia(
  //       this.x + this.velocidadX,
  //       this.y + this.velocidadY,
  //       otro.x + otro.velocidadX,
  //       otro.y + otro.velocidadY
  //     );
  //     if (distancia < this.radio + otro.radio) {
  //       let x = this.x - otro.x;
  //       let y = this.y - otro.y;

  //       fuerza.x += x * 0.1;
  //       fuerza.y += y * 0.1;
  //     }
  //   }
  //   this.aceleracionX += fuerza.x;
  //   this.aceleracionY += fuerza.y;
  //   // this.aplicarAceleracion(fuerza.x, fuerza.y);
  // }

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

  // moverSegunTeclado() {
  //   let delta = 1;
  //   if (this.juego.teclado.a) {
  //     // this.aceleracionX -= delta;
  //     Matter.Body.applyForce(this.caja, { x: this.caja.position.x, y: this.caja.position.y }, { x: -0.005, y: 0 });
  //   } else if (this.juego.teclado.d) {
  //     // this.aceleracionX += delta;

  //     Matter.Body.applyForce(this.caja, { x: this.caja.position.x, y: this.caja.position.y }, { x: 0.005, y: 0 });

  //   }

  //   if (this.juego.teclado.w) {
  //     if (this.llegueAlPiso) {
  //       // this.aceleracionY -= 90;
  //       // this.llegueAlPiso = false;

  //       Matter.Body.applyForce(this.caja, { x: this.caja.position.x, y: this.caja.position.y }, { x: 0.000, y: -0.01 });

  //     }
  //   }
  //   // console.log(this.aceleracionY)
  // }
  limitarAceleracionEnX() {
    let acMax = 2;
    if (Math.abs(this.aceleracionX) > acMax) {
      this.aceleracionX = this.aceleracionX > 0 ? acMax : -acMax;
    }
    // if (Math.abs(this.aceleracionY) > acMax) {
    //   this.aceleracionY = this.aceleracionY > 0 ? acMax : -acMax;
    // }
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
          obs.velocidadX++;
          this.velocidadX = 0;
        } else if (this.x > obs.x + obs.ancho / 2 && this.velocidadX < 0) {
          this.velocidadX = 0;
          obs.velocidadX--;
          // console.log("chocando desde der");
        }
      }
    }
  }

  evaluarVida() {
    if (this.vida <= 0) {
      this.juego.sacarChaboncito(this);
      this.juego.ponerSangreDondeEstabaUnChaboncito(this);
    }
  }

  update(time) {
    if (!this.listo) return;

    this.time = time;

    this.evaluarVida();

    // this.separacion();
    // this.seguirMouse();

    // this.limitarAceleracionEnX();

    // this.sumarAccALaVel();

    // // this.noPasarPorObstaculos();

    // this.sumarVelALaPos();

    // //friccion
    // // this.velocidadX *= 0.98
    // // this.velocidadY *= 0.98

    // this.mantenerLaVelocidadPorDebajoDeLaMax();

    // this.velocidadX *= 0.9;
    // this.velocidadY *= 0.9;

    // this.cambiarOrdenEnZ();

    // this.evaluarSiLlegueAlLimiteDeLaPantalla();
    // this.cuandoLlegaAlMArgenAparecePorElOtroLado();

    // this.manejarDireccionDelSprite();
    // this.cambiarVelocidadDeReproduccionDelSpriteAnimado();

    if (this.juego.contadorDeFrames % 5 == 0) {
      this.perseguirAlPlayer();
    }

    //APLICAR X E Y A LA POSICION DEL GRAFICO EN EL STAGE DE PIXI
    this.sprite.x = this.caja.position.x;
    this.sprite.y = this.caja.position.y;

    this.actualizarZIndex();
  }

  perseguirAlPlayer() {
    let angulo = Math.atan2(
      this.juego.player.container.y - this.sprite.y,
      this.juego.player.container.x - this.sprite.x
    );
    Matter.Body.setVelocity(this.caja, {
      x: Math.cos(angulo),
      y: Math.sin(angulo),
    });
  }

  mantenerLaVelocidadPorDebajoDeLaMax() {
    let velMaxX = 10;
    let velMaxY = 30;
    if (Math.abs(this.velocidadX) > velMaxX) {
      this.velocidadX = this.velocidadX > 0 ? velMaxX : -velMaxX;
    }
    if (Math.abs(this.velocidadY) > velMaxY) {
      this.velocidadY = this.velocidadY > 0 ? velMaxY : -velMaxY;
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
