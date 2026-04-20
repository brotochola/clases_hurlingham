class Enemigo extends Persona {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, {
      estadoInicial: "walk",
      ...opciones,
    });

    this.id = juego.enemigos.length;
    this.tipo = "enemigo";

    this.targetX = juego.centroUrbano.posicion.x;
    this.targetY = juego.centroUrbano.posicion.y;

    juego.enemigos.push(this);
  }
}

window.Enemigo = Enemigo;
