class FSMState {
  constructor(owner, fsm) {
    this.currentFrame = 0;
    this.fsm = fsm;
    this.owner = owner;
    this.prevState = null;
  }

  onEnter() {}
  onExit() {}
  onUpdate() {
    this.currentFrame++;
    this.doChecks();
  }
  doChecks() {}
}
