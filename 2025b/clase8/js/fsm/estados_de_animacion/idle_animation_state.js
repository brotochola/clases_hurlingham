class IdleAnimationState extends FSMState {
  onEnter() {}
  onExit() {}
  onUpdate() {
    if (
      (this.owner.behaviorFSM || {}).currentStateName === "enCombate" ||
      this.owner.noPuedoPegarPeroEstoyEnCombate
    ) {
      this.owner.sprite.changeAnimation("combat");
    } else {
      this.owner.sprite.changeAnimation("idle");
    }
    super.onUpdate();
  }

  doChecks() {
    if (
      this.owner.behaviorFSM &&
      this.owner.behaviorFSM.currentStateName === "pasadoDeBando"
    ) {
      this.fsm.setState("convertirse");
      return;
    }
    if (this.owner.velocidadLineal > 0.1) {
      this.fsm.setState("walk");
    }
  }
}
