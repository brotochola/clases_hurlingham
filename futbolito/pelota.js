class Pelota extends Entidad {
  constructor(juego) {
    super(MITAD_DE_CANCHA, MITAD_TRANSVERSAL, juego);

    this.crearGrafico();
    this.velocidad.y = Math.random() * 0.1 - 0.05;
  }
  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .circle(0, 0, 5)
      .fill(0xffffff)
      .setStrokeStyle(0x000000)
      .stroke();
    this.container.addChild(this.grafico);
  }
  evaluarEntorno() {
    this.velocidadLineal = this.velocidad.mag();
    this.estaYendoDespacio = this.velocidadLineal < 1;
    this.estaDelLadoDerecho = this.pos.x > MITAD_DE_CANCHA;
    this.estaDelLadoIzquierdo = !this.estaDelLadoDerecho;

    this.estaEnLaMitadInferior = this.pos.y > MITAD_TRANSVERSAL;
    this.estaEnLaMitadSuperior = !this.estaEnLaMitadInferior;

    this.estaEnElAreaDerecha =
      this.pos.x > 840 && this.pos.y > 210 && this.pos.y < 575;
    this.estaEnElAreaIzquierda =
      this.pos.x < 225 && this.pos.y > 210 && this.pos.y < 575;
  }

  update() {
    super.update();
    this.evaluarEntorno();

    this.rebotarContraLosBordes();
    this.velocidad.mult(0.99);
  }
}
