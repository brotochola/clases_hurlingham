class Entity {
  constructor(x = 0, y = 0, game = null) {
    // Position properties (using Victor.js)
    this.position = new Victor(x, y);
    this.prevPosition = new Victor(x, y);

    // Velocity properties (using Victor.js)
    this.velocity = new Victor(0, 0);

    // Acceleration properties (using Victor.js)
    this.acceleration = new Victor(0, 0);

    // Movement properties
    this.maxAcceleration = 500; // pixels per second squared
    this.maxSpeed = 2000; // pixels per second
    this.friction = 0.95; // friction coefficient (0-1)
    this.static = false; // whether the entity is static (doesn't move)

    // Game reference
    this.game = game;

    // Grid reference
    this.currentCell = null;

    // PIXI Container
    this.container = new PIXI.Container();
    this.container.pivot.x = 0.5;
    this.container.pivot.y = 1;
    this.container.x = x;
    this.container.y = y;
    this.z = 0;

    this.setZIndex();

    // Default visual representation (a simple colored rectangle)
    this.graphics = new PIXI.Graphics();
    this.graphics.rect(-8, -16, 16, 16); // Draw rectangle so bottom edge is at y=0
    this.graphics.fill(0x3498db); // Blue color
    this.container.addChild(this.graphics);

    // Entity properties
    this.id = Entity.generateId();
    this.active = true;
    this.visible = true;

    // Add to game's main container if game is provided
    if (this.game && this.game.mainContainer) {
      this.game.mainContainer.addChild(this.container);
    }

    this.game.entities.add(this);
    // Add to spatial grid if game is provided
    if (this.game && this.game.grid) {
      this.game.grid.addEntity(this);
    }
  }

  /**
   * Generate unique ID for entities
   * @returns {string} Unique ID
   */
  static generateId() {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set the position of the entity
   * @param {number} x - New X position
   * @param {number} y - New Y position
   */
  setPosition(x, y) {
    this.prevPosition.copy(this.position);
    this.position.x = x;
    this.position.y = y;

    // Update PIXI container position
    this.container.x = x;
    this.container.y = y;
  }

  /**
   * Move the entity by a delta amount
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  move(dx, dy) {
    this.setPosition(this.position.x + dx, this.position.y + dy);
  }

  /**
   * Set the velocity of the entity
   * @param {number} vx - Velocity X
   * @param {number} vy - Velocity Y
   */
  setVelocity(vx, vy) {
    this.velocity.x = vx;
    this.velocity.y = vy;
  }

  /**
   * Set the acceleration of the entity
   * @param {number} ax - Acceleration X
   * @param {number} ay - Acceleration Y
   */
  setAcceleration(ax, ay) {
    this.acceleration.x = ax;
    this.acceleration.y = ay;
  }

  /**
   * Apply a force to the entity
   * @param {Victor|number} force - Force vector or X component
   * @param {number} [y] - Y component if first parameter is a number
   */
  applyForce(force, y) {
    if (this.static) return;

    if (typeof force === "number") {
      this.acceleration.add(new Victor(force, y || 0));
    } else {
      this.acceleration.add(force);
    }

    // Limit acceleration
    if (this.acceleration.magnitude() > this.maxAcceleration) {
      this.acceleration.normalize().multiplyScalar(this.maxAcceleration);
    }
  }

  /**
   * Update the entity (called every frame)
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.active || this.static) return;
    // Store previous position
    this.prevPosition.copy(this.position);

    // Apply acceleration to velocity
    const accelDelta = this.acceleration.clone().multiplyScalar(deltaTime);
    this.velocity.add(accelDelta);

    // Apply friction
    this.velocity.multiplyScalar(this.friction);

    // Limit velocity to max speed
    if (this.velocity.magnitude() > this.maxSpeed) {
      this.velocity.normalize().multiplyScalar(this.maxSpeed);
    }

    // Apply velocity to position
    const velocityDelta = this.velocity.clone().multiplyScalar(deltaTime);
    this.position.add(velocityDelta);

    this.z = this.currentCell.z;

    // Update PIXI container position
    this.container.x = this.position.x;
    this.container.y = this.position.y - this.z;
    this.x = this.position.x;
    this.y = this.position.y;

    // Reset acceleration (forces need to be applied each frame)
    this.acceleration.zero();

    // Update spatial grid cell if position changed
    if (
      this.game &&
      this.game.grid &&
      (this.position.x !== this.prevPosition.x ||
        this.position.y !== this.prevPosition.y)
    ) {
      this.game.grid.updateEntity(this);
    }

    // Update visibility
    this.container.visible = this.visible && this.active;
    this.setZIndex();
  }

  setZIndex() {
    this.container.zIndex = (this.position.y || 1) * 10 + 1000000000;
  }

  /**
   * Set the visual appearance of the entity
   * @param {number} color - Hex color value
   * @param {number} width - Width of the entity
   * @param {number} height - Height of the entity
   */
  setAppearance(color = 0x3498db, width = 16, height = 16) {
    this.graphics.clear();
    this.graphics.rect(-width / 2, -height, width, height); // Bottom-center positioning
    this.graphics.fill(color);
  }

  /**
   * Set the visibility of the entity
   * @param {boolean} visible - Whether the entity should be visible
   */
  setVisible(visible) {
    this.visible = visible;
    this.container.visible = visible && this.active;
  }

  /**
   * Set the active state of the entity
   * @param {boolean} active - Whether the entity should be active
   */
  setActive(active) {
    this.active = active;
    this.container.visible = this.visible && active;
  }

  /**
   * Get the distance to another entity
   * @param {Entity} other - The other entity
   * @returns {number} Distance to the other entity
   */
  distanceTo(other) {
    return this.position.distance(other.position);
  }

  /**
   * Get entities within a radius of this entity
   * @param {number} radius - Search radius
   * @returns {Set} Set of entities within the radius
   */
  getEntitiesInRadius(radius) {
    if (!this.game || !this.game.grid) {
      return new Set();
    }

    const entities = this.game.grid.getEntitiesInRadius(
      this.position.x,
      this.position.y,
      radius
    );
    entities.delete(this); // Remove self from results
    return entities;
  }

  /**
   * Check if this entity overlaps with another entity
   * @param {Entity} other - The other entity
   * @param {number} threshold - Overlap threshold (default: 16)
   * @returns {boolean} Whether the entities overlap
   */
  overlaps(other, threshold = 16) {
    return this.distanceTo(other) < threshold;
  }

  /**
   * Add a child display object to this entity's container
   * @param {PIXI.DisplayObject} child - The child to add
   */
  addChild(child) {
    this.container.addChild(child);
  }

  /**
   * Remove a child display object from this entity's container
   * @param {PIXI.DisplayObject} child - The child to remove
   */
  removeChild(child) {
    this.container.removeChild(child);
  }

  /**
   * Destroy the entity and clean up resources
   */
  destroy() {
    // Remove from spatial grid
    if (this.game && this.game.grid) {
      this.game.grid.removeEntity(this);
    }

    // Remove from main container
    if (this.game && this.game.mainContainer && this.container.parent) {
      this.game.mainContainer.removeChild(this.container);
    }

    // Destroy PIXI container
    this.container.destroy({ children: true });

    // Clear references
    this.game = null;
    this.currentCell = null;
    this.container = null;
    this.graphics = null;
    this.active = false;
  }

  /**
   * Get debug information about the entity
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      id: this.id,
      position: { x: this.position.x, y: this.position.y },
      velocity: { x: this.velocity.x, y: this.velocity.y },
      acceleration: { x: this.acceleration.x, y: this.acceleration.y },
      maxAcceleration: this.maxAcceleration,
      maxSpeed: this.maxSpeed,
      friction: this.friction,
      static: this.static,
      active: this.active,
      visible: this.visible,
      currentCell: this.currentCell
        ? {
            x: this.currentCell.x,
            y: this.currentCell.y,
            key: this.game?.grid?.getCellKey(
              this.currentCell.x,
              this.currentCell.y
            ),
          }
        : null,
    };
  }
}
