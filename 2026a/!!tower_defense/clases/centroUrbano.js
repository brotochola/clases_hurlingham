class CentroUrbano extends Casita {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.radio = 120;

    this.tipo = "centroUrbano";
    this.inicializarSprite(juego.texturas["centroUrbano"]);
  }
}

window.CentroUrbano = CentroUrbano;
