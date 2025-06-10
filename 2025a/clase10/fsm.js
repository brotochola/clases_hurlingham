export class FSM {
  constructor(owner, config) {
    this.config = config;
    this.owner = owner;

    this.currentState = config.initialState;
    this.globalTransitions = config.globalTransitions || [];
  }

  update(frameNumber) {
    // Check global transitions first
    if (this.checkGlobalTransitions()) {
      return; // Global transition occurred, skip normal state update
    }

    // Check state-specific transitions
    if (this.checkStateTransitions()) {
      return; // State transition occurred, skip normal state update
    }

    // Normal state update
    this.config.states[this.currentState].onUpdate(frameNumber);
  }

  checkGlobalTransitions() {
    // Handle both array format and object format for global transitions
    if (Array.isArray(this.globalTransitions)) {
      // Original array format: [{targetState: "state", condition: fn, onTransition?: fn}]
      for (const globalTransition of this.globalTransitions) {
        if (globalTransition.targetState == this.currentState) {
          //if we are in this state, we don't need to check the condition
          continue;
        }
        if (globalTransition.condition(this.owner)) {
          this.setState(globalTransition.targetState);

          // Execute optional callback
          if (globalTransition.onTransition) {
            globalTransition.onTransition(this.owner);
          }

          return true; // Transition occurred
        }
      }
    } else if (
      typeof this.globalTransitions === "object" &&
      this.globalTransitions !== null
    ) {
      // New object format: {stateName: conditionFunction}
      for (const [targetState, condition] of Object.entries(
        this.globalTransitions
      )) {
        if (targetState === this.currentState) {
          // Skip if we're already in this state
          continue;
        }

        // Execute the condition function
        if (condition()) {
          this.setState(targetState);
          return true; // Transition occurred
        }
      }
    }

    return false; // No transition occurred
  }

  checkStateTransitions() {
    const currentStateConfig = this.config.states[this.currentState];

    // Check if the current state has transitions defined
    if (!currentStateConfig.transitions) {
      return false; // No transitions defined for this state
    }

    // Check each transition condition
    for (const [targetState, condition] of Object.entries(
      currentStateConfig.transitions
    )) {
      if (targetState === this.currentState) {
        // Skip self-transitions to avoid infinite loops
        continue;
      }

      // Execute the condition function
      if (condition.bind(this.owner)(this.owner)) {
        this.setState(targetState);
        return true; // Transition occurred
      }
    }

    return false; // No transition occurred
  }

  setState(state) {
    if (state === this.currentState) {
      return;
    }
    const previousState = this.currentState;
    this.config.states[this.currentState].onExit(state);
    this.config.states[state].onEnter(previousState);
    this.currentState = state;
  }
}
