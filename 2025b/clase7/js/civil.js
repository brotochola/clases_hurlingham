class Civil extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.tipo = Math.floor(Math.random() * 3) + 1;
    this.bando = "civil";
    this.crearSpritesheetAnimado("civil" + this.tipo);
    this.factorPerseguir = 0.4;
    this.factorEscapar = 1 - this.coraje;
    this.distanciaParaLlegarALTarget = 500;

    this.factorRepelerSuavementeObstaculos = 0.66;
    this.aceleracionMaxima = 0.17;
    this.velocidadMaxima = 1.9;
    this.factorAlineacion = 0.33;
  }

  tick() {
    if (this.muerto) return;
    this.verificarSiEstoyMuerto();

    this.percibirEntorno();
    this.caminarSinRumbo();
    // this.cohesion();
    this.alineacion();
    this.separacion();

    // this.perseguir();
    if (this.enemigoMasCerca) {
      this.perseguidor = this.enemigoMasCerca;
      this.escapar();
    }

    this.noChocarConObstaculos();
    this.repelerSuavementeObstaculos();
    // this.pegarSiEstaEnMiRango();

    this.aplicarFisica();

    this.calcularAnguloYVelocidadLineal();
  }
}
