class EntidadEstatica extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.radio = 20;
    this.sprite = null;

    this.render();
  }
  calcularRadio() {
    this.radio = (this.sprite.width + Math.sqrt(this.sprite.height)) * 0.25;
  }

  tick() {}
}
