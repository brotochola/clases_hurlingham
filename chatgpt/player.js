class Player extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 3, 20, juego);

    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid

    // Cargar la textura del sprite desde el <img>

    this.sprite.texture = PIXI.Texture.from("./player.png");

    // Asegurarse de que el tamaño sea 25x25
    this.sprite.width = 25;
    this.sprite.height = 25;
    this.debug = 0;
    this.juego.app.stage.addChild(this.sprite);
  }

  disparar() {
    let angulo = Math.atan2(
      this.juego.mouse.x-this.sprite.x ,
      this.juego.mouse.y-this.sprite.y 
    );
    this.juego.balas.push(
      new Bala(
        this.sprite.x,
        this.sprite.y,
        this.juego,
        Math.sin(angulo),
        Math.cos(angulo)
      )
    );
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
    // const vecAtraccionMouse = this.atraccionAlMouse(mouse);

    // this.aplicarFuerza(vecAtraccionMouse);

    super.update();
  }

  atraccionAlMouse(mouse) {
    if (!mouse) return null;
    const vecMouse = new PIXI.Point(
      mouse.x - this.sprite.x,
      mouse.y - this.sprite.y
    );
    const distanciaCuadrada = distanciaAlCuadrado(
      this.sprite.x,
      this.sprite.y,
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
