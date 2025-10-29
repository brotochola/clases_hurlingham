class ConvertirseAnimationState extends FSMState {
  animationName = "spellcast";
  onEnter() {
    this.owner.sprite.changeAnimation(this.animationName);
  }
  onExit() {}

  doChecks() {
    if (
      this.owner.behaviorFSM &&
      this.owner.behaviorFSM.currentStateName !== "pasadoDeBando"
    ) {
      this.fsm.setState("idle");
      return;
    }
  }
}
