class EntidadEstatica extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.vida = 1;
    this.radio = 20;
    this.sprite = null;

    this.render();
  }

  tick() {}

  render() {
    if (!this.container)
      return console.warn("entidadEstatica no tiene container");

    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    this.container.zIndex = this.posicion.y;
  }
}
