import { BaseEntity } from "./baseEntity.js";
import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";

export class Home extends BaseEntity {
  constructor(x, y, game, team = 1) {
    super(x, y, game);
    this.team = team;
    // Resource storage
    this.woodStorage = 0;
    this.goldStorage = 0;

    // Visual properties
    this.width = 80;
    this.height = 80;
    this.radius = 40;

    // Interaction properties
    this.interactionRadius = 30; // How close units need to be to deposit resources

    this.createSprite();
    this.game.homes.push(this);
  }

  createSprite() {
    this.sprite = new PIXI.Graphics();
    this.container.addChild(this.sprite);
  }

  // Resource management methods
  depositResources(woodAmount, goldAmount) {
    this.woodStorage += woodAmount;
    this.goldStorage += goldAmount;

    return {
      woodDeposited: woodAmount,
      goldDeposited: goldAmount,
      woodRejected: 0,
      goldRejected: 0,
    };
  }

  canAcceptResources(woodAmount = 0, goldAmount = 0) {
    return true; // Can always accept resources with unlimited storage
  }

  getStorageCapacity() {
    return {
      current: this.woodStorage + this.goldStorage,
      wood: this.woodStorage,
      gold: this.goldStorage,
    };
  }

  // Main update method
  update(frameNumber) {
    // Update physics (though home typically doesn't move)
    this.updatePhysics();

    // Update sprite
    this.render();
  }

  // Status methods for debugging
  getStatus() {
    return {
      resources: `Wood: ${this.woodStorage}, Gold: ${this.goldStorage}`,
      total: this.woodStorage + this.goldStorage,
    };
  }

  render() {
    if (!this.sprite) return;
    const teamColors = {
      1: 0x4169e1, // Blue
      2: 0x32cd32, // Green
      3: 0xff4500, // Orange Red
      4: 0x9932cc, // Dark Orchid
    };
    const color = teamColors[this.team] || 0x4169e1; // Default to blue if team not found

    const graphics = this.sprite;
    graphics.clear();

    // const color = 0x4169e1;

    graphics.beginFill(color);
    graphics.drawRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    graphics.endFill();

    graphics.beginFill(0xdc143c);
    graphics.moveTo(-this.width / 2 - 5, -this.height / 2);
    graphics.lineTo(0, -this.height / 2 - 15);
    graphics.lineTo(this.width / 2 + 5, -this.height / 2);
    graphics.lineTo(-this.width / 2 - 5, -this.height / 2);
    graphics.endFill();

    graphics.beginFill(0x8b4513);
    graphics.drawRect(-8, this.height / 2 - 20, 16, 20);
    graphics.endFill();

    const totalResources = this.woodStorage + this.goldStorage;
    if (totalResources > 0) {
      graphics.lineStyle(2, 0xffd700);
      graphics.drawRect(
        -this.width / 2 - 2,
        -this.height / 2 - 2,
        this.width + 4,
        this.height + 4
      );
    }
  }
}
