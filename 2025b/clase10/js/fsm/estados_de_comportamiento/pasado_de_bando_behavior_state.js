class PasadoDeBandoBehaviorState extends FSMState {
  //cuando se pasan de bando los chaboncitos se ponen en este estado
  //se muestra una animacion (ver PasadoDeBandoAnimationState), y durante este tiempo
  //no pegan, no se mueven

  onEnter() {
    // console.log("pasado de bando", this.owner);
    try {
      this.cantFrames = AnimatedCharacter.getDurationInFrames("spellcast");
    } catch (e) {
      this.cantFrames = 35; //si no se puede obtener el duracion de la animacion, se pone un valor por defecto
    }
  }
  onExit() {}
  onUpdate() {
    super.onUpdate();

    // Mantener el emoji visible durante todo el estado
    // Se llama en cada frame porque el globo de diálogo se crea asíncronamente
    this.owner.hablar("🤷");

    this.owner.percibirEntorno();

    this.owner.separacion();

    this.owner.noChocarConObstaculos();

    this.owner.aplicarFisica();

    this.owner.calcularAnguloYVelocidadLineal();
  }

  doChecks() {
    if (this.currentFrame > this.cantFrames) {
      if (this.owner.enemigoMasCerca) {
        this.fsm.setState("idle");
      } else {
        this.fsm.setState("enCombate");
      }
    }
  }
}
