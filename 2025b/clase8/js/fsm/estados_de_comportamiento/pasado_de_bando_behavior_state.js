class PasadoDeBandoBehaviorState extends FSMState {
  //cuando se pasan de bando los chaboncitos se ponen en este estado
  //se muestra una animacion (ver PasadoDeBandoAnimationState), y durante este tiempo
  //no pegan, no se mueven

  onEnter() {
    try {
      this.cantFrames = AnimatedCharacter.getDurationInFrames("spellcast");
    } catch (e) {
      this.cantFrames = 35; //si no se puede obtener el duracion de la animacion, se pone un valor por defecto
    }
  }
  onExit() {}
  onUpdate() {
    // console.log(
    //   "onUpdate PasadoDeBandoBehaviorState",
    //   this.owner.nombre,
    //   this.currentFrame,
    //   this.cantFrames
    // );
    super.onUpdate();

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
