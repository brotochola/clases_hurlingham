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

    if (this.juego.contadorDeFrames % 4 == 1) {
      if (Math.abs(this.velocidad.x) < 0.5 && Math.abs(this.velocidad.y) < 0.5) {
        this.cambiarSprite("idle");
      } else {
        this.calcularAngulo();
        this.ajustarSpriteSegunAngulo();
      }
      this.hacerQueLaVelocidadDeLaAnimacionCoincidaConLaVelocidad();
    }
    this.calcularYAplicarFuerzas();
    super.update();
  }

  calcularYAplicarFuerzas() {
    //EN FUERZAS VOY A SUMAR TODAS LAS FUERZAS Q FRAME A FRAME ACTUAN SOBRE EL PERRITO
    let fuerzas = new PIXI.Point(0, 0);
    //ATRACCION AL MOUSE
    const vecAtraccionMouse = this.atraccionAlMouse();
    if (vecAtraccionMouse) {
      fuerzas.x += vecAtraccionMouse.x;
      fuerzas.y += vecAtraccionMouse.y;
    }

    const repulsionAObstaculos = this.repelerObstaculos(this.obtenerVecinos());
    if (repulsionAObstaculos) {
      fuerzas.x += repulsionAObstaculos.x;
      fuerzas.y += repulsionAObstaculos.y;
    }

    const bordes = this.ajustarPorBordes();
    fuerzas.x += bordes.x;
    fuerzas.y += bordes.y;
    this.fuerzas = fuerzas;
    this.aplicarFuerza(fuerzas);
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

  atraccionAlMouse() {
    if (!this.juego.mouse) return null;
    const vecMouse = new PIXI.Point(
      this.juego.mouse.x - this.juego.app.stage.x - this.container.x,
      this.juego.mouse.y - this.juego.app.stage.y - this.container.y
    );

    let distCuadrada = vecMouse.x ** 2 + vecMouse.y ** 2;

    if (distCuadrada < this.juego.grid.cellSize ** 2) return null;

    return {
      x: (vecMouse.x - this.velocidad.x) * 0.001,
      y: (vecMouse.y - this.velocidad.y) * 0.001,
    };
  }
}
