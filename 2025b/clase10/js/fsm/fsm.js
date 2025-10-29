class FSM {
  constructor(owner, config) {
    this.owner = owner;
    this.states = {};
    this.currentState = null;
    this.currentStateName = null;
    this.prevState = null;
    this.prevStateName = null;

    Object.keys(config.states).forEach(
      (state) => (this.states[state] = new config.states[state](owner, this))
    );

    this.setState(config.initialState);
  }

  update(frameNumber) {
    if (!this.currentState) return;
    this.currentState.onUpdate(frameNumber);
  }

  setState(state) {
    if (!this.states[state]) {
      return console.warn(
        "ERROR setState",
        this.owner.nombre,
        state,
        "no existe este estado"
      );
    }
    if (this.states[state] === this.currentState) {
      return;
    }
    const previousState = this.currentState;
    this.prevState = this.currentState;
    this.prevStateName = this.currentStateName;

    if (this.currentState) {
      this.currentState.onExit(state);
    }

    this.currentState = this.states[state];
    if (!this.currentState) return;
    this.currentState.onEnter(previousState);
    this.currentStateName = state;
  }
  destroy() {
    this.states = {};
    this.currentState = null;
    this.currentStateName = null;
    this.prevState = null;
    this.prevStateName = null;
  }
}
