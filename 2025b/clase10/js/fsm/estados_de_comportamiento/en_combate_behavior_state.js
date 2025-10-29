class EnCombateBehaviorState extends FSMState {
  onEnter() {
    this.owner.hablar("😠");
  }

  onUpdate() {
    super.onUpdate();

    this.owner.percibirEntorno();

    this.owner.separacion();
    this.owner.perseguir();

    if (this.owner instanceof Amigo) {
      this.owner.seguirAlLider();
    }

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
    if (this.owner.vida < this.owner.vidaMaxima - this.owner.coraje) {
      this.fsm.setState("huyendo");
      return;
    }

    if (!this.owner.enemigoMasCerca) {
      this.fsm.setState("idle");
    }
  }
}
