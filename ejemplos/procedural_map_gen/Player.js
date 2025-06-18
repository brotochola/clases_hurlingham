class Player extends Entity {
  constructor(x = 0, y = 0, game = null) {
    super(x, y, game);

    // Player-specific properties
    this.moveSpeed = 200000; // pixels per second
    this.inputVector = new Victor(0, 0);

    // Set player appearance - white, larger size
    this.setAppearance(0xffffff, 20, 20);
    this.id = "player";

    // Player has different movement properties
    this.maxAcceleration = 3000; // Much higher acceleration for snappy movement
    this.maxSpeed = 800; // Super fast max speed!
    this.friction = 0.9;

    this.createCharacter();
    // this.character.changeAnimation("idle");
    this.graphics.destroy();
  }

  async createCharacter() {
    const result = await AnimatedCharacter.CreateCharacterFromMegaSpritesheet(
      "chabon2.png",
      64,
      64
    );
    this.character = result.character;
    this.container.addChild(this.character);
    this.character.anchor.set(0.5, 1);
  }

  /**
   * Handle input for player movement
   * @param {Object} input - Input state object with direction properties
   */
  handleInput(input) {
    // Reset input vector
    this.inputVector.zero();

    // Apply input based on pressed keys
    if (input.up) this.inputVector.y -= 1;
    if (input.down) this.inputVector.y += 1;
    if (input.left) this.inputVector.x -= 1;
    if (input.right) this.inputVector.x += 1;

    // Normalize diagonal movement
    if (this.inputVector.magnitude() > 0) {
      this.inputVector.normalize();
    }
  }

  /**
   * Update player movement based on input
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Apply movement force based on input
    if (this.inputVector.magnitude() > 0) {
      const moveForce = this.inputVector.clone().multiplyScalar(this.moveSpeed);
      this.applyForce(moveForce);
    }

    // Call parent update
    super.update(deltaTime);
    const magnitude = this.velocity.magnitude();
    // Update character direction based on velocity
    if (this.character && magnitude > 0) {
      // Calculate angle in radians, then convert to degrees
      const angle =
        Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);

      // Normalize angle to 0-360 degrees
      const normalizedAngle = ((angle % 360) + 360) % 360;

      // Determine direction based on angle
      let direction;
      if (normalizedAngle >= 315 || normalizedAngle < 45) {
        direction = "right";
      } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
        direction = "down";
      } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
        direction = "left";
      } else {
        direction = "up";
      }

      // Update character direction
      this.character.changeDirection(direction);

      if (magnitude > 10 && magnitude < this.maxSpeed * 0.5) {
        this.character.changeAnimation("walk");
      } else if (magnitude > this.maxSpeed * 0.5) {
        this.character.changeAnimation("run");
      } else if (magnitude < 10) {
        this.character.changeAnimation("idle");
      }
    }
  }

  /**
   * Get player-specific debug information
   * @returns {Object} Extended debug information
   */
  getDebugInfo() {
    const baseDebug = super.getDebugInfo();
    return {
      ...baseDebug,
      type: "Player",
      moveSpeed: this.moveSpeed,
      inputVector: { x: this.inputVector.x, y: this.inputVector.y },
    };
  }
}
