class Depredador extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.agregarCuadraditoRojo();

    this.container.name = "depredador_" + this.id;
  }
  agregarCuadraditoRojo() {
    this.graphics = new PIXI.Graphics();

    this.graphics.rect(0, -64, 10, 10);

    this.graphics.fill(0xff0000);
    this.container.addChild(this.graphics);
  }

  update() {
    // console.log("update depredador", this.id);
    super.update();

    // this.asignarFuerzaQueMeLlevaAlMouse();

    this.presaMasCercana = this.verCualEsLaPresaMasCercana();

    this.moverHaciaLaPresa();

    this.siEstoyMuyCercaMeComoALaPresaMasCercana();
  }

  siEstoyMuyCercaMeComoALaPresaMasCercana() {
    const difX = this.presaMasCercana.x - this.x;
    const difY = this.presaMasCercana.y - this.y;
    const dist = calcularDistancia(difX, difY);
    if (dist < 30) {
      this.presaMasCercana.morir();
    }
  }

  moverHaciaLaPresa() {
    // let dx = presa.x - depredador.x;
    // let dy = presa.y - depredador.y;
    // let angulo = Math.atan2(dy, dx); // da el ángulo en radianes

    const difX = this.presaMasCercana.x - this.x;
    const difY = this.presaMasCercana.y - this.y;

    const angulo = Math.atan2(difY, difX); // da el ángulo en radianes

    const factor = 0.3;
    const x = Math.cos(angulo) * factor;
    const y = Math.sin(angulo) * factor;
    this.asignarAceleracion(x, y);
  }

  verCualEsLaPresaMasCercana() {
    //cada depredador "mira a su alrededor" y determina cual es la presa mas cercana.
    let distMinima = 999999999;
    let cual = -1;
    const cantidadDePresas = this.juego.presas.length;
    for (let i = 0; i < cantidadDePresas; i++) {
      const presa = this.juego.presas[i]; //esto es cada presa
      //distancia entre yo, depredador y esta presa
      const dist = calcularDistancia(this.x - presa.x, this.y - presa.y);

      if (dist < distMinima) {
        cual = i;
        distMinima = dist;
      }
    }

    return this.juego.presas[cual];
  }
}
