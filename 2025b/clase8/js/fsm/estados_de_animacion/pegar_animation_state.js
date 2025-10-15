class PegarAnimationState extends FSMState {
  cantFrames = 30;
  animationName = "slash";
  onEnter() {
    this.cantFrames =
      this.owner.sprite.animationConfigs[this.animationName].frames /
      this.owner.sprite.animationConfigs[this.animationName].speed;

    this.currentFrame = 0;
    this.owner.sprite.changeAnimation(this.animationName);
  }
  onExit() {}

  onUpdate() {
    super.onUpdate();
  }

  doChecks() {
    if (this.currentFrame > this.cantFrames) {
      this.fsm.setState("idle");
    }
  }
}
