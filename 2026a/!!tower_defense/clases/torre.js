class Torre extends Casita {
  constructor(x, y, juego, tipo = 1) {
    super(x, y, juego);
    this.radio = 40;

    this.tipo = "torre";
    this.tipoDeTorre = tipo;
    this.inicializarSprite(juego.texturas[`torre${tipo}`]);
  }
}

window.Torre = Torre;
