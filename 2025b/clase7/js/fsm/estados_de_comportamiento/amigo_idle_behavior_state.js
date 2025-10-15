class AmigoIdleBehaviorState extends FSMState {
  onUpdate() {
    super.onUpdate();

    this.owner.percibirEntorno();

    //hacer cosas
    this.owner.seguirAlLider();
    this.owner.cohesion();

    this.owner.separacion();

    // this.owner.perseguir();

    this.owner.noChocarConObstaculos();
    this.owner.repelerSuavementeObstaculos();

    // this.owner.pegarSiEstaEnMiRango();

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
