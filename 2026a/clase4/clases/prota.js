class Protagonista extends Persona {
  constructor(x, y, textures, juego) {
    super(x, y, textures, juego);
  }

  update() {
    this.manejarmeConElTeclado();
    super.update();
  }

  manejarmeConElTeclado() {
    const cuantaAceleracion = 0.1;

    if (this.juego.teclado.a) {
      this.sumarAceleracion(-cuantaAceleracion, 0);
    } else if (this.juego.teclado.d) {
      this.sumarAceleracion(cuantaAceleracion, 0);
    }

    if (this.juego.teclado.s) {
      this.sumarAceleracion(0, cuantaAceleracion);
    } else if (this.juego.teclado.w) {
      this.sumarAceleracion(0, -cuantaAceleracion);
    }
  }
}
