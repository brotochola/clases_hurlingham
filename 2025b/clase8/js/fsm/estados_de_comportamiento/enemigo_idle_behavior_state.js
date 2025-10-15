class EnemigoIdleBehaviorState extends FSMState {
  onEnter() {}
  onExit() {}
  onUpdate() {
    super.onUpdate();

    this.owner.percibirEntorno();

    this.owner.cohesion();

    this.owner.separacion();

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
      this.fsm.setState("enCombate");
    }
  }
}
