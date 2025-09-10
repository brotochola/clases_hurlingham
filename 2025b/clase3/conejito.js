class Conejito extends GameObject {
  constructor(texture, x, y, juego) {
    super(texture, x, y, juego);
  }

  getOtrosConejitos() {
    return this.juego.conejitos;
  }
}
