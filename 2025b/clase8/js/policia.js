class Policia extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.bando = "policia";
    this.crearSpritesheetAnimado("poli");
    this.factorPerseguir = 0.4;
    this.factorEscapar = 1 - this.coraje;
    this.distanciaParaLlegarALTarget = 500;

    this.factorRepelerSuavementeObstaculos = 0.66;
    this.aceleracionMaxima = 0.11;
    this.velocidadMaxima = 1;
    this.factorAlineacion = 0.33;
  }

  tick() {
    if (this.muerto) return;
    this.verificarSiEstoyMuerto();

    this.percibirEntorno();
    // this.caminarSinRumbo();
    // this.cohesion();
    // this.alineacion();
    this.separacion();

    // this.perseguir();
    // if (this.enemigoMasCerca) {
    //   this.perseguidor = this.enemigoMasCerca;
    //   this.escapar();
    // }

    this.noChocarConObstaculos();
    this.repelerSuavementeObstaculos();
    // this.pegarSiEstaEnMiRango();

    this.aplicarFisica();

    this.calcularAnguloYVelocidadLineal();
  }
}
