// Basic State Enum
const States = {
  IDLE: "idle",
  FLEEING: "fleeing",
  FOLLOWING: "following",
  ATTACKING: "attacking",
};

// Basic Action Enum
const Actions = {
  WALK: "walk",
  RUN: "run",
  JUMP: "jump",
  ATTACK: "attack",
};

// NPC class with FSM and Stamina
class NPC {
  constructor(name) {
    this.name = name;
    this.state = States.IDLE; // Initial state
    this.action = Actions.WALK; // Initial action
    this.stamina = 100; // Initial stamina
    this.distanceToTarget = 100; // Example variable
    this.health = 100; // Another example variable
    this.isUnderAttack = false;
  }

  // Method to update NPC based on environment variables
  update() {
    this.updateStats();
    this.lookAround();
    this.changeStateBasedOnVariables();
    this.performActionBasedOnState();
    this.updateAnimation();
  }
  updateStats() {
    // Stamina consumption happens only when running
    if (this.action === Actions.RUN) {
      this.stamina -= 0.2; // Adjust consumption rate as needed
      if (this.stamina < 0) this.stamina = 0; // Prevent negative stamina
    }
  }

  // Look around to gather environmental variables
  lookAround() {
    // Example: Check distance to target, health, etc.
    this.distanceToTarget -= 1; // Simulating that the target is getting closer
    this.isUnderAttack = this.health < 50; // Simulate attack condition
  }

  // Change state based on gathered variables
  changeStateBasedOnVariables() {
    if (this.isUnderAttack) {
      this.state = States.FLEEING;
    } else if (this.distanceToTarget < 10) {
      this.state = States.ATTACKING;
    } else if (this.distanceToTarget < 50) {
      this.state = States.FOLLOWING;
    } else {
      this.state = States.IDLE;
    }
  }

  // Perform action based on the current state and stamina
  performActionBasedOnState() {
    // Choose action based on stamina using ternary operator
    this.action = this.stamina > 20 ? Actions.RUN : Actions.WALK;

    // Adjust action for specific states if needed
    if (this.state === States.ATTACKING) {
      this.action = Actions.ATTACK;
    }
  }

  // Update the animation based on the current action and state
  updateAnimation() {
    let spriteName;

    switch (this.state) {
      case States.FLEEING:
        spriteName = "fleeing_";
        break;
      case States.FOLLOWING:
        spriteName = "following_";
        break;
      case States.ATTACKING:
        spriteName = "attacking_";
        break;
      case States.IDLE:
      default:
        spriteName = "idle_";
        break;
    }

    // Append the action to determine the full sprite name
    switch (this.action) {
      case Actions.RUN:
        spriteName += "run";
        break;
      case Actions.WALK:
        spriteName += "walk";
        break;
      case Actions.ATTACK:
        spriteName += "attack";
        break;
      case Actions.JUMP:
        spriteName += "jump";
        break;
    }

    console.log(
      `${this.name} is in state: ${this.state}, performing action: ${this.action}`
    );
    console.log(`Switching sprite to: ${spriteName}`);

    // Simulate changing the sprite
    this.sprite = spriteName;
    // In an actual implementation, you would change the texture or animation
    // of the sprite in your game engine, e.g., PixiJS or Phaser.
  }
}

// Example usage
const npc = new NPC("Goblin");

// Simulate game loop
for (let i = 0; i < 60; i++) {
  npc.update();
}
