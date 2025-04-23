class Protagonista extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.container.name = "protagonista";

    this.container.tint = 0x0000ff;
    this.velocidadMaxima = 4.5;
    this.accMax = 0.66;
  }

  update() {
    if (this.muerta) return;

    this.sacarInformacionDelEntorno();

    this.moverseSegunTeclado();

    this.limitarAceleracion();

    this.limitarVelocidad();

    super.update();

    this.limitarPosicion();
  }

  limitarPosicion() {
    if (!this.juego.fondo) return;
    if (this.x > this.juego.fondo.width) {
      this.x = this.juego.fondo.width;
      this.velX = 0;
      this.asignarAceleracion(-0.1, 0);
    }
  }

  moverseSegunTeclado() {
    const vel = 92745;
    let accX = 0;
    let accY = 0;

    // Detectar teclas presionadas
    if (this.juego.teclado.w) accY = -1;
    if (this.juego.teclado.s) accY = 1;
    if (this.juego.teclado.a) accX = -1;
    if (this.juego.teclado.d) accX = 1;

    // Normalizar para movimiento diagonal
    if (accX !== 0 && accY !== 0) {
      // Si nos movemos en diagonal, normalizar el vector
      const longitud = Math.sqrt(accX * accX + accY * accY);
      accX = (accX / longitud) * vel;
      accY = (accY / longitud) * vel;
    } else {
      // Movimiento en línea recta
      accX *= vel;
      accY *= vel;
    }

    this.asignarAceleracion(accX, accY);
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
