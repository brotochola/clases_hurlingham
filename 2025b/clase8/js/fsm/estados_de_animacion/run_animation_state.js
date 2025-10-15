class RunAnimationState extends FSMState {
  onEnter() {
    this.owner.sprite.changeAnimation("run");
  }
  onExit() {}

  onUpdate() {
    super.onUpdate();

    this.owner.sprite.animationSpeed =
      (0.25 * this.owner.velocidadLineal) / this.owner.velocidadMaxima;
  }

  doChecks() {
    if (this.owner.velocidadLineal < this.owner.velocidadMaxima * 0.66) {
      this.fsm.setState("walk");
    }
  }
}
