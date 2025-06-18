class Animal extends Entity {
  constructor(x = 0, y = 0, game = null) {
    super(x, y, game);

    // Animal-specific properties
    this.separationRadius = 50; // Distance to maintain from other animals
    this.separationStrength = 1000; // Force strength for separation
    this.flowfieldStrength = 500; // Force strength for following flowfield
    this.maxWanderForce = 20; // Maximum random wander force

    // Animal movement properties
    this.maxSpeed = 80; // Slower than player
    this.maxAcceleration = 150;
    this.friction = 0.98; // Less friction for smoother movement

    // Set random animal appearance
    const animalColors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd,
    ];
    const randomColor =
      animalColors[Math.floor(Math.random() * animalColors.length)];
    this.setAppearance(randomColor, 12, 12);

    // Wander behavior
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderRadius = 25;
    this.wanderDistance = 40;
    this.wanderChangeRate = 0.1;

    this.game.animals.add(this);
  }

  /**
   * Calculate separation force from nearby animals
   * @returns {Victor} Separation force vector
   */
  calculateSeparation() {
    const separationForce = new Victor(0, 0);
    const nearbyAnimals = this.getNearbyAnimals();

    if (nearbyAnimals.length === 0) {
      return separationForce;
    }

    // Calculate average separation vector
    for (const animal of nearbyAnimals) {
      const distance = this.distanceTo(animal);
      if (distance > 0 && distance < this.separationRadius) {
        // Vector pointing away from the other animal
        const away = this.position.clone().subtract(animal.position);
        // Stronger force when closer
        const strength =
          (this.separationRadius - distance) / this.separationRadius;
        away.normalize().multiplyScalar(strength);
        separationForce.add(away);
      }
    }

    if (separationForce.magnitude() > 0) {
      separationForce.normalize().multiplyScalar(this.separationStrength);
    }

    return separationForce;
  }

  /**
   * Get nearby animals within separation radius
   * @returns {Array} Array of nearby Animal entities
   */
  getNearbyAnimals() {
    const nearbyEntities = this.getEntitiesInRadius(this.separationRadius);
    return Array.from(nearbyEntities).filter(
      (entity) => entity instanceof Animal
    );
  }

  /**
   * Calculate flowfield following force
   * @returns {Victor} Flowfield force vector
   */
  calculateFlowfieldForce() {
    if (!this.currentCell) {
      return new Victor(0, 0);
    }

    // Get the flow direction from the current cell
    const flowDirection = this.currentCell.getFlowDirection();

    if (flowDirection.magnitude() === 0) {
      return new Victor(0, 0);
    }

    // Apply flowfield force
    return flowDirection.clone().multiplyScalar(this.flowfieldStrength);
  }

  /**
   * Calculate wander force for random movement
   * @returns {Victor} Wander force vector
   */
  calculateWanderForce() {
    // Change wander angle slightly each frame
    this.wanderAngle += (Math.random() - 0.5) * this.wanderChangeRate;

    // Calculate wander target position
    const futurePosition = this.position
      .clone()
      .add(
        this.velocity.clone().normalize().multiplyScalar(this.wanderDistance)
      );

    const wanderTarget = futurePosition.add(
      new Victor(
        Math.cos(this.wanderAngle) * this.wanderRadius,
        Math.sin(this.wanderAngle) * this.wanderRadius
      )
    );

    // Calculate force towards wander target
    const wanderForce = wanderTarget.subtract(this.position);

    if (wanderForce.magnitude() > this.maxWanderForce) {
      wanderForce.normalize().multiplyScalar(this.maxWanderForce);
    }

    return wanderForce;
  }

  /**
   * Update animal behavior and movement
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.active || this.static) return;

    // Calculate behavior forces
    const separationForce = this.calculateSeparation();
    const flowfieldForce = this.calculateFlowfieldForce();
    const wanderForce = this.calculateWanderForce();

    // Apply forces with different weights
    this.applyForce(separationForce.multiplyScalar(1.0)); // Separation is highest priority
    this.applyForce(flowfieldForce.multiplyScalar(0.7)); // Flowfield is medium priority
    this.applyForce(wanderForce.multiplyScalar(0.3)); // Wander is lowest priority

    // Call parent update
    super.update(deltaTime);
  }

  /**
   * Get animal-specific debug information
   * @returns {Object} Extended debug information
   */
  getDebugInfo() {
    const baseDebug = super.getDebugInfo();
    const nearbyAnimals = this.getNearbyAnimals();

    return {
      ...baseDebug,
      type: "Animal",
      separationRadius: this.separationRadius,
      nearbyAnimalsCount: nearbyAnimals.length,
      wanderAngle: this.wanderAngle,
      flowfieldStrength: this.flowfieldStrength,
    };
  }

  /**
   * Factory method to create a random animal at a position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Game} game - Game instance
   * @returns {Animal} New animal instance
   */
  static createRandom(x, y, game) {
    const animal = new Animal(x, y, game);

    // Add some random initial velocity
    const randomVelocity = new Victor(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40
    );
    animal.setVelocity(randomVelocity.x, randomVelocity.y);

    return animal;
  }
}
