class HuyendoBehaviorState extends FSMState {
  onEnter() {
    this.owner.hablar("😨");
    this.originalFactorEscapar = this.owner.factorEscapar;
    this.owner.factorEscapar = 0.5;

    // Solo los amigos modifican factorSeguirAlLider
    if (this.owner instanceof Amigo) {
      this.originalFactorSeguirAlLider = this.owner.factorSeguirAlLider;
      this.owner.factorSeguirAlLider = 0.75;
    }
  }

  onExit() {
    this.owner.factorEscapar = this.originalFactorEscapar;

    // Solo los amigos restauran factorSeguirAlLider
    if (this.owner instanceof Amigo) {
      this.owner.factorSeguirAlLider = this.originalFactorSeguirAlLider;
    }
  }

  onUpdate() {
    super.onUpdate();

    this.owner.percibirEntorno();

    this.owner.evaluarSiMeConviertoEnAmigo();

    this.owner.separacion();

    // Solo los amigos siguen al líder cuando huyen
    if (this.owner instanceof Amigo) {
      this.owner.seguirAlLider();
    }

    this.owner.repelerEnemigos();

    this.owner.noChocarConObstaculos();

    //moverse
    this.owner.aplicarFisica();

    this.owner.calcularAnguloYVelocidadLineal();
  }

  doChecks() {
    if (this.owner.vida > this.owner.vidaMaxima - this.owner.coraje) {
      this.fsm.setState("idle");
    }
  }
}
