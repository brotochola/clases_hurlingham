class WalkAnimationState extends FSMState {
  onEnter() {
    this.owner.sprite.changeAnimation("walk");
  }

  onUpdate() {
    super.onUpdate();

    this.owner.sprite.animationSpeed =
      0.05 + (0.3 * this.owner.velocidadLineal) / this.owner.velocidadMaxima;
  }
  doChecks() {
    if (this.owner.velocidadLineal > this.owner.velocidadMaxima * 0.66) {
      this.fsm.setState("run");
    } else if (this.owner.velocidadLineal < 0.1) {
      this.fsm.setState("idle");
    }
  }
}
