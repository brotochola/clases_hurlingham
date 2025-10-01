class EntidadEstatica extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.vida = 1;
    this.radio = 20;
    this.sprite = null;

    this.render();
  }

  tick() {}
}
