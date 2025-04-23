class Presa extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);
    // this.agregarCuadraditoVerde();
    this.container.name = "presa_" + this.id;
  }
  agregarCuadraditoVerde() {
    this.graphics = new PIXI.Graphics();

    this.graphics.rect(85, 0, 10, 10);

    this.graphics.fill(0x00ff00);
    this.container.addChild(this.graphics);
  }
  morir() {
    console.log(this.id, "se murio");
    for (let i = 0; i < this.juego.presas.length; i++) {
      const presa = this.juego.presas[i];
      if (presa.id == this.id) {
        this.muerta = true;
        this.juego.presas.splice(i, 1);
        this.container.destroy();
        return;
      }
    }
  }

  update() {
    if (this.muerta) return;
    // console.log("update de presa", this.id);
    super.update();

    this.sacarInformacionDelEntorno();

    this.hacerCosasSegunFactores();
  }

  hacerCosasSegunFactores() {
    if (this.distAlDepredadorMasCercano < 300) {
      this.escaparDelDepredadorMasCercano();
    } else if (this.distAlArbolMasCercano > 20) {
      this.irHaciaElArbolMasCercano();
    } else {
      //no hay nada q hacer
      if (!this.arbolMarCercano) return;
      this.arbolMarCercano.restarComida(this);
    }
  }

  irHaciaElArbolMasCercano() {
    const difX = this.arbolMarCercano.x - this.x;
    const difY = this.arbolMarCercano.y - this.y;

    const angulo = Math.atan2(difY, difX); // da el ángulo en radianes

    const factor = 0.4;
    const x = Math.cos(angulo) * factor;
    const y = Math.sin(angulo) * factor;
    this.asignarAceleracion(x, y);
  }

  sacarInformacionDelEntorno() {
    this.depredadorMasCercano = this.verCualEsElDEpredadorMasCercano();

    if (!this.depredadorMasCercano) return;

    this.distAlDepredadorMasCercano = calcularDistancia(
      this.depredadorMasCercano.x - this.x,
      this.depredadorMasCercano.y - this.y
    );
    this.arbolMarCercano = this.buscarArbolMasCercano();

    if (!this.arbolMarCercano) return;
    this.distAlArbolMasCercano = calcularDistancia(
      this.arbolMarCercano.x - this.x,
      this.arbolMarCercano.y - this.y
    );
  }

  buscarArbolMasCercano() {
    let distMinima = 999999999;
    let cual = -1;

    for (let i = 0; i < this.juego.arboles.length; i++) {
      const arbol = this.juego.arboles[i]; //esto es cada presa

      //distancia entre yo, depredador y esta presa
      const dist = calcularDistancia(this.x - arbol.x, this.y - arbol.y);

      if (dist < distMinima) {
        cual = i;
        distMinima = dist;
      }
    }

    return this.juego.arboles[cual];
  }

  escaparDelDepredadorMasCercano() {
    const difX = this.depredadorMasCercano.x - this.x;
    const difY = this.depredadorMasCercano.y - this.y;

    const angulo = Math.atan2(difY, difX); // da el ángulo en radianes

    const factor = 0.4;
    const x = Math.cos(angulo) * factor;
    const y = Math.sin(angulo) * factor;
    this.asignarAceleracion(-x, -y);
  }

  verCualEsElDEpredadorMasCercano() {
    let distMinima = 999999999;
    let cual = -1;

    for (let i = 0; i < this.juego.depredadores.length; i++) {
      const depre = this.juego.depredadores[i]; //esto es cada presa
      //distancia entre yo, depredador y esta presa
      const dist = calcularDistancia(this.x - depre.x, this.y - depre.y);

      if (dist < distMinima) {
        cual = i;
        distMinima = dist;
      }
    }

    return this.juego.depredadores[cual];
  }
}
