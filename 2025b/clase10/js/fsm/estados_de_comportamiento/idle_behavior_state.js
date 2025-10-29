class IdleBehaviorState extends FSMState {
  onEnter() {
    this.owner.hablar("😊");
  }

  onUpdate() {
    super.onUpdate();

    this.owner.percibirEntorno();

    this.owner.cohesion();
    this.owner.separacion();

    // Solo los amigos siguen al líder
    if (this.owner instanceof Amigo) {
      this.owner.seguirAlLider();
    }

    this.owner.noChocarConObstaculos();
    this.owner.repelerSuavementeObstaculos();

    //moverse
    this.owner.aplicarFisica();

    this.owner.calcularAnguloYVelocidadLineal();

    if (this.owner.enemigoMasCerca) {
      this.owner.asignarTarget(this.owner.enemigoMasCerca);
    }
  }

  doChecks() {
    if (this.owner.enemigoMasCerca) {
      if (this.owner.vida < this.owner.vidaMaxima - this.owner.coraje) {
        this.fsm.setState("huyendo");
      } else {
        this.fsm.setState("enCombate");
      }
    }
  }
}
