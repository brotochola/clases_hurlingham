class Player extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 3, juego);
    this.velocidadMaximaOriginal = 3;
    this.juego = juego;
    this.grid = juego.grid;

    this.cargarVariosSpritesAnimados(
      {
        idle: "./img/player_idle.png",
        correr: "./img/player_run.png",
        disparar: "./img/player_shoot.png",
      },
      128,
      128,
      0.2,
      (e) => {
        this.cambiarSprite("idle");
      }
    );

    // this.juego.app.stage.addChild(this.sprite);
  }

  disparar() {
    let sprite = this.cambiarSprite("disparar");
    sprite.loop = false;
    setTimeout(() => {
      this.cambiarSprite("idle"); //
    }, 100);

    let angulo = Math.atan2(
      this.juego.mouse.x - this.container.x,
      this.juego.mouse.y - this.container.y
    );
    this.juego.balas.push(
      new Bala(
        this.container.x,
        this.container.y - 40,
        this.juego,
        Math.sin(angulo),
        Math.cos(angulo)
      )
    );

    this.velocidad.x = 0;
    this.velocidad.y = 0;
  }

  update() {
    this.vecinos = this.obtenerVecinos();

    if (this.juego.keyboard.a) {
      this.velocidad.x = -1;
    } else if (this.juego.keyboard.d) {
      this.velocidad.x = 1;
    } else {
      this.velocidad.x = 0;
    }

    if (this.juego.keyboard.w) {
      this.velocidad.y = -1;
    } else if (this.juego.keyboard.s) {
      this.velocidad.y = 1;
    } else {
      this.velocidad.y = 0;
    }

    let cantidadDeObjetosEnMiCelda = Object.keys(
      (this.miCeldaActual || {}).objetosAca || {}
    ).length;

    if (cantidadDeObjetosEnMiCelda > 3) {
      let cant = cantidadDeObjetosEnMiCelda - 3;
      this.velocidadMax = this.velocidadMaximaOriginal * (0.3 + 0.7 / cant);
    } else {
      this.velocidadMax = this.velocidadMaximaOriginal;
    }

    if (Math.abs(this.velocidad.y) > 0 || Math.abs(this.velocidad.x) > 0) {
      this.cambiarSprite("correr");
    } else if (this.spriteActual == "correr") {
      this.cambiarSprite("idle");
    }
    // const vecAtraccionMouse = this.atraccionAlMouse(mouse);

    // this.aplicarFuerza(vecAtraccionMouse);

    super.update();
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
