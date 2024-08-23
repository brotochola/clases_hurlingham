class Player extends Objeto {
  constructor(x, y, velMax, juego) {
    super(x, y, velMax, juego);
    this.velocidadMax = velMax;
    this.juego = juego;
    this.grid = juego.grid;

    this.cargarVariosSpritesAnimadosDeUnSoloArchivo(
      {
        archivo: "./img/perro.png",
        frameWidth: 32,
        frameHeight: 32,
        velocidad: velMax * 0.05,
        animaciones: {
          correrAbajo: {
            desde: {
              x: 0,
              y: 0,
            },
            hasta: {
              x: 3,
              y: 0,
            },
          },
          correrLado: {
            desde: {
              x: 0,
              y: 1,
            },
            hasta: {
              x: 3,
              y: 1,
            },
          },
          correrArriba: {
            desde: {
              x: 0,
              y: 2,
            },
            hasta: {
              x: 3,
              y: 2,
            },
          },
          idle: {
            desde: {
              x: 3,
              y: 7,
            },
            hasta: {
              x: 3,
              y: 7,
            },
          },
        },
      },
      (animaciones) => {
        this.listo = true;
        this.cambiarSprite("correrLado");
        for (let sprite of Object.values(this.spritesAnimados)) {
          sprite.scale.set(2);
        }
      }
    );

    // this.juego.app.stage.addChild(this.sprite);
  }

  update() {
    if (!this.listo) return;
    this.vecinos = this.obtenerVecinos();

    if (this.juego.keyboard.a) {
      this.velocidad.x = -5;
    } else if (this.juego.keyboard.d) {
      this.velocidad.x = 5;
    } else {
      this.velocidad.x = 0;
    }

    if (this.juego.keyboard.w) {
      this.velocidad.y = -5;
    } else if (this.juego.keyboard.s) {
      this.velocidad.y = 5;
    } else {
      this.velocidad.y = 0;
    }

    let cantidadDeObjetosEnMiCelda = Object.keys(
      (this.miCeldaActual || {}).objetosAca || {}
    ).length;

    // if (cantidadDeObjetosEnMiCelda > 3) {
    //   let cant = cantidadDeObjetosEnMiCelda - 3;
    //   this.velocidadMax = this.velocidadMaximaOriginal * (0.3 + 0.7 / cant);
    // } else {
    //   this.velocidadMax = this.velocidadMaximaOriginal;
    // }

    // if (this.juego.contadorDeFrames % 4 == 1) {
    if (Math.abs(this.velocidad.x) < 1 && Math.abs(this.velocidad.y) < 1) {
      this.cambiarSprite("idle");
    } else {
      //CADA 4 FRAMES
      this.calcularAngulo();
      this.ajustarSpriteSegunAngulo();
    }
    // }

    // const vecAtraccionMouse = this.atraccionAlMouse(mouse);

    // this.aplicarFuerza(vecAtraccionMouse);

    super.update();
  }
  ajustarSpriteSegunAngulo() {
    if (this.angulo >= 315 || this.angulo <= 45) {
      this.cambiarSprite("correrLado");
    } else if (this.angulo >= 135 && this.angulo <= 225) {
      this.cambiarSprite("correrLado");
    } else if (this.angulo > 45 && this.angulo < 135) {
      this.cambiarSprite("correrArriba");
    } else if (this.angulo > 225 && this.angulo < 315) {
      this.cambiarSprite("correrAbajo");
    }
  }

  atraccionAlMouse(mouse) {
    if (!mouse) return null;
    const vecMouse = new PIXI.Point(
      mouse.x - this.container.x,
      mouse.y - this.container.y
    );
    const distanciaCuadrada = distanciaAlCuadrado(
      this.container.x,
      this.container.y,
      mouse.x,
      mouse.y
    );

    if (distanciaCuadrada < 100 * 100) {
      vecMouse.x *= 0.2; // Intensidad de atracción al mouse
      vecMouse.y *= 0.2;
      return vecMouse;
    }

    return null;
  }
}
