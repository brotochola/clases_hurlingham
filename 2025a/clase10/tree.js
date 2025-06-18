import { BaseEntity } from "./baseEntity.js";
import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";

export class Tree extends BaseEntity {
  constructor(x, y, game) {
    super(x, y, game);

    // Tree specific properties
    this.maxWoodAmount = 200; // Maximum wood capacity
    this.woodAmount = Math.random() * this.maxWoodAmount + 1; // Total wood available

    this.choppingRate = 0.15; // Wood per second when being chopped
    this.growthRate = 0.0001; // Wood regeneration per second
    this.isAlive = true; // Whether this tree can be chopped
    this.choppers = []; // How many entities are currently chopping
    this.maxChoppers = 2; // Maximum concurrent choppers
    this.health = 1.0; // Tree health (0 = dead/stump, 1 = fully grown)

    // Visual properties
    this.size = 25; // Size for rendering
    this.type = "tree";

    // Physics properties - trees don't move
    this.mass = 800; // Heavy so they don't move
    this.friction = 0.99; // High friction
    this.maxSpeed = 0; // Can't move

    this.game.trees.push(this);
    this.createSprite();
    this.crearCirculitoEnMatter(true, this.size);
  }

  createSprite() {
    this.sprite = new PIXI.Graphics();
    this.container.addChild(this.sprite);
  }

  // Chop wood from this tree
  chopWood(amount = this.choppingRate, who) {
    if (!this.choppers.includes(who)) {
      this.choppers.push(who);
    }

    if (!this.isAlive || this.woodAmount <= 0) {
      return 0;
    }

    const choppedAmount = Math.min(amount, this.woodAmount);
    this.woodAmount -= choppedAmount;

    // Update health based on remaining wood
    this.health = this.woodAmount / this.maxWoodAmount;

    // Kill tree if depleted
    if (this.woodAmount <= 0) {
      this.isAlive = false;
      this.health = 0;
    }

    return choppedAmount;
  }

  // Check if this tree can be chopped
  canBeChopped() {
    // Count how many NPCs are currently chopping this tree
    // const choppersCount = this.countCurrentChoppers();

    return (
      this.isAlive &&
      this.woodAmount > 0 &&
      this.choppers.length < this.maxChoppers
    );
  }

  // Get the percentage of wood remaining
  getWoodPercentage() {
    return this.woodAmount / this.maxWoodAmount;
  }

  // Check if tree is a stump (dead but could regrow)
  isStump() {
    return !this.isAlive && this.woodAmount < this.maxWoodAmount * 0.1;
  }

  // Check if tree is mature (full grown)
  isMature() {
    return this.isAlive && this.woodAmount >= this.maxWoodAmount * 0.8;
  }

  removeMeFromChoppers(who) {
    this.choppers = this.choppers.filter((chopper) => chopper !== who);
  }

  // Update the tree (growth, etc.)
  update(frameNumber) {
    // Regrow wood slowly if not at max capacity
    if (this.woodAmount < this.maxWoodAmount) {
      this.woodAmount += this.growthRate;
      this.woodAmount = Math.min(this.woodAmount, this.maxWoodAmount);

      // Update health
      this.health = this.woodAmount / this.maxWoodAmount;
    }

    // Come back to life if we have enough wood again
    if (this.woodAmount > this.maxWoodAmount * 0.1) {
      this.isAlive = true;
      this.body.isSensor = false;
    } else {
      this.isAlive = false;
      this.body.isSensor = true;
    }

    if (!this.canBeChopped()) this.choppers = [];

    // Update physics (though trees shouldn't move)
    this.updatePhysics();

    // Update sprite
    this.render();
  }

  // Get info about this tree
  getInfo() {
    return {
      wood: Math.floor(this.woodAmount),
      maxWood: this.maxWoodAmount,
      percentage: Math.floor(this.getWoodPercentage() * 100),
      health: Math.floor(this.health * 100),
      isAlive: this.isAlive,
      choppers: this.countCurrentChoppers(),
      maxChoppers: this.maxChoppers,
      isMature: this.isMature(),
      isStump: this.isStump(),
    };
  }

  render() {
    if (!this.sprite) return;

    const graphics = this.sprite;
    graphics.clear();

    const healthPercentage = this.health;
    let canopyColor = 0x228b22;
    let trunkColor = 0x8b4513;

    if (!this.isAlive) {
      canopyColor = 0x654321;
      trunkColor = 0x2f1b14;
    } else if (healthPercentage < 0.3) {
      canopyColor = 0x6b8e23;
    } else if (healthPercentage < 0.7) {
      canopyColor = 0x32cd32;
    }

    const canopySize = (this.size / 2) * Math.max(0.3, healthPercentage);
    graphics.beginFill(canopyColor);
    graphics.drawCircle(0, 0, canopySize);
    graphics.endFill();

    const trunkHeight = this.size / 4;
    graphics.beginFill(trunkColor);
    graphics.drawRect(-3, canopySize - 3, 6, trunkHeight);
    graphics.endFill();

    if (healthPercentage < 1) {
      const barWidth = this.size;
      const barHeight = 4;
      const yOffset = -this.size / 2 - 8;

      graphics.lineStyle(1, 0x000000);
      graphics.beginFill(0x333333);
      graphics.drawRect(-barWidth / 2, yOffset, barWidth, barHeight);
      graphics.endFill();

      graphics.beginFill(0x228b22);
      graphics.drawRect(
        -barWidth / 2,
        yOffset,
        barWidth * this.getWoodPercentage(),
        barHeight
      );
      graphics.endFill();
    }
  }
}
