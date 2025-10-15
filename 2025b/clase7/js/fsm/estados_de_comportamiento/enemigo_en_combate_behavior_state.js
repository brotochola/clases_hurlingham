class EnemigoEnCombateBehaviorState extends FSMState {
  onEnter() {}
  onExit() {}
  onUpdate() {
    super.onUpdate();

    this.owner.percibirEntorno();

    this.owner.evaluarSiMeConviertoEnAmigo();
    this.owner.separacion();

    this.owner.perseguir();

    this.owner.noChocarConObstaculos();
    // this.owner.repelerSuavementeObstaculos();

    this.owner.pegarSiEstaEnMiRango();

    //moverse
    this.owner.aplicarFisica();

    this.owner.calcularAnguloYVelocidadLineal();
    this.owner.siEstoyPeleandoMirarHaciaMiOponente();

    if (this.owner.enemigoMasCerca) {
      this.owner.asignarTarget(this.owner.enemigoMasCerca);
    }
  }

  doChecks() {
    if (!this.owner.enemigoMasCerca) {
      this.fsm.setState("idle");
    }
  }
}
