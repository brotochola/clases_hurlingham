class Protagonista extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.container.name = "protagonista";

    this.container.tint = 0x0000ff;
    this.velocidadMaxima = 3;
    this.accMax = 0.33;
    this.valorFriccion = 0.95;
  }

  update() {
    if (this.muerta) return;

    this.sacarInformacionDelEntorno();

    this.moverseSegunTeclado();

    super.update();

    this.limitarPosicion();
  }

  limitarPosicion() {
    if (!this.juego.fondo) return;
    if (this.x > this.juego.fondo.width) {
      this.x = this.juego.fondo.width;
      this.velX = 0;
    }
  }

  moverseSegunTeclado() {
    let accX = 0;
    let accY = 0;

    // Detectar teclas presionadas
    if (this.juego.teclado.w) accY = -1;
    if (this.juego.teclado.s) accY = 1;
    if (this.juego.teclado.a) accX = -1;
    if (this.juego.teclado.d) accX = 1;

    if (accX !== 0 && accY !== 0) {
      // Si nos movemos en diagonal, normalizar el vector
      accX *= 0.707;
      accY *= 0.707;
    }

    this.aplicarAceleracion(accX, accY);
  }

  sacarInformacionDelEntorno() {
    this.depredadorMasCercano = this.verCualEsElDEpredadorMasCercano();
    if (this.depredadorMasCercano) {
      this.distAlDepredadorMasCercano = calcularDistancia(
        this.depredadorMasCercano.x - this.x,
        this.depredadorMasCercano.y - this.y
      );
    }
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
