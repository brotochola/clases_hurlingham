import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";
import Victor from "https://cdn.skypack.dev/victor";
import { generateName } from "./utils.js";

export class BaseEntity {
  constructor(x = 0, y = 0, game) {
    this.game = game;
    // Vector properties for physics
    this.position = new Victor(x, y);
    this.velocity = new Victor(0, 0);
    this.acceleration = new Victor(0, 0);

    // Generate a realistic name instead of random string
    this.id = generateName();

    // Physics properties
    this.mass = 1;
    this.friction = 0.9; // Friction coefficient (0-1, where 1 = no friction)
    this.maxSpeed = 5; // Maximum speed limit
    this.maxAcceleration = 2; // Maximum acceleration limit

    // For backward compatibility with existing code
    this.x = x;
    this.y = y;
    this.container = new PIXI.Container();

    this.container.x = this.x;
    this.container.y = this.y;
    this.container.name = this.id;

    // Track if entity is added to game
    this.addedToGame = false;

    // Automatically add to game if game is provided
    if (this.game) {
      // Use setTimeout to ensure game is fully initialized
      setTimeout(() => {
        this.addToGame();
      }, 0);
    }
  }

  // Add this entity to the game
  addToGame() {
    if (!this.addedToGame && this.game) {
      // Add to game's entities array
      this.game.entities.push(this);

      // Add container to game's entity container
      if (this.game.entityContainer) {
        this.game.entityContainer.addChild(this.container);
      }

      this.addedToGame = true;
      console.log(`${this.constructor.name} ${this.id} added to game`);
    }
  }

  // Remove this entity from the game
  removeFromGame() {
    if (this.addedToGame && this.game) {
      // Remove from game's entities array
      const index = this.game.entities.indexOf(this);
      if (index > -1) {
        this.game.entities.splice(index, 1);
      }

      // Remove from specific type arrays
      if (this.constructor.name === "NPC") {
        const npcIndex = this.game.npcs.indexOf(this);
        if (npcIndex > -1) {
          this.game.npcs.splice(npcIndex, 1);
        }
      } else if (this.constructor.name === "GoldMine") {
        const mineIndex = this.game.goldMines.indexOf(this);
        if (mineIndex > -1) {
          this.game.goldMines.splice(mineIndex, 1);
        }
      } else if (this.constructor.name === "Tree") {
        const treeIndex = this.game.trees.indexOf(this);
        if (treeIndex > -1) {
          this.game.trees.splice(treeIndex, 1);
        }
      } else if (this.constructor.name === "Home") {
        const homeIndex = this.game.homes.indexOf(this);
        if (homeIndex > -1) {
          this.game.homes.splice(homeIndex, 1);
        }
      }

      // Remove container from game's entity container
      if (this.container && this.game.entityContainer) {
        this.game.entityContainer.removeChild(this.container);
      }

      // Destroy sprite and container
      if (this.sprite) {
        this.sprite.destroy();
        this.sprite = null;
      }

      if (this.container) {
        this.container.destroy();
        this.container = null;
      }

      this.addedToGame = false;
      console.log(`${this.constructor.name} ${this.id} removed from game`);
    }
  }

  // Apply Newton's physics: acceleration -> velocity -> position
  updatePhysics(deltaTime = 1) {
    if (!this.body) return;
    // Limit acceleration to max acceleration
    // if (this.acceleration.magnitude() > this.maxAcceleration) {
    //   this.acceleration.normalize().multiplyScalar(this.maxAcceleration);
    // }

    // // Apply acceleration to velocity
    // this.velocity.add(
    //   Victor.fromObject(this.acceleration).multiplyScalar(deltaTime)
    // );

    // // Apply friction to velocity
    // this.velocity.multiplyScalar(this.friction);

    // // Limit velocity to max speed
    // if (this.velocity.magnitude() > this.maxSpeed) {
    //   this.velocity.normalize().multiplyScalar(this.maxSpeed);
    // }

    // if (this.velocity.magnitude() < 0.1) {
    //   this.velocity.zero();
    // }

    // // Apply velocity to position
    // this.position.add(
    //   Victor.fromObject(this.velocity).multiplyScalar(deltaTime)
    // );

    // Update x, y for backward compatibility
    this.x = this.body.position.x;
    this.y = this.body.position.y;

    this.position.x = this.x;
    this.position.y = this.y;

    // Update container position
    if (this.container && this.body) {
      this.container.x = this.x;
      this.container.y = this.y;
    }

    this.container.zIndex = this.y;
    // Reset acceleration (it needs to be applied each frame)
    this.acceleration.zero();
  }

  // Apply a force to the entity
  applyForce(force) {
    // F = ma, so a = F/m

    // const acceleration = Victor.fromObject(force).divideScalar(this.mass);
    // this.acceleration.add(acceleration);

    const nuevaFuerzaAjustada = { x: force.x * 0.001, y: force.y * 0.001 };

    Matter.Body.applyForce(this.body, this.body.position, nuevaFuerzaAjustada);
  }

  // Move towards a target position
  moveTowards(targetX, targetY, force = 1) {
    const target = new Victor(targetX, targetY);

    const direction = target.clone().subtract(this.position).normalize();
    const moveForce = direction.multiplyScalar(force);
    this.applyForce(moveForce);
  }

  // Get distance to a target
  distanceTo(targetX, targetY) {
    const target = new Victor(targetX, targetY);
    return this.position.distance(target);
  }

  // Get angle to a target
  angleTo(targetX, targetY) {
    const target = new Victor(targetX, targetY);
    const direction = target.clone().subtract(this.position);
    return Math.atan2(direction.y, direction.x);
  }
  calculateDistance(targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Get current speed
  getSpeed() {
    if (this.dead) return 0;
    return Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
  }

  // Get current angle of movement
  getMovementAngle() {
    if (this.dead) return 0;
    return Math.atan2(this.body.velocity.y, this.body.velocity.x);
  }

  // Default render method - can be overridden by subclasses
  render() {
    // Base implementation does nothing
    // Subclasses should override this method to update their sprites
  }
}
