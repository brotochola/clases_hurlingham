import { BaseEntity } from "./baseEntity.js";
import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";

export class GoldMine extends BaseEntity {
  constructor(x, y, game) {
    super(x, y, game);

    // GoldMine specific properties
    this.goldAmount = 100; // Total gold available
    this.maxGoldAmount = 100; // Maximum gold capacity
    this.miningRate = 0.1; // Gold per second when being mined
    this.regenerationRate = 0.01; // Gold regeneration per second
    this.isActive = true; // Whether this mine can be used
    this.minersCount = 0; // How many entities are currently mining
    this.maxMiners = 3; // Maximum concurrent miners

    // Visual properties
    this.size = 30; // Size for rendering
    this.type = "goldMine";

    // Physics properties - gold mines don't move
    this.mass = 1000; // Very heavy so they don't move
    this.friction = 0.99; // High friction
    this.maxSpeed = 0; // Can't move
    this.createSprite();
    this.game.goldMines.push(this);
  }

  createSprite() {
    this.sprite = new PIXI.Graphics();
    this.container.addChild(this.sprite);
  }

  // Mine gold from this location
  mineGold(amount = this.miningRate) {
    if (!this.isActive || this.goldAmount <= 0) {
      return 0;
    }

    const minedAmount = Math.min(amount, this.goldAmount);
    this.goldAmount -= minedAmount;

    // Deactivate if depleted
    if (this.goldAmount <= 0) {
      this.isActive = false;
    }

    return minedAmount;
  }

  // Check if this mine can be mined
  canBeMined() {
    return (
      this.isActive && this.goldAmount > 0 && this.minersCount < this.maxMiners
    );
  }

  // Add a miner to this location
  addMiner() {
    if (this.minersCount < this.maxMiners) {
      this.minersCount++;
      return true;
    }
    return false;
  }

  // Remove a miner from this location
  removeMiner() {
    if (this.minersCount > 0) {
      this.minersCount--;
    }
  }

  // Get the percentage of gold remaining
  getGoldPercentage() {
    return this.goldAmount / this.maxGoldAmount;
  }

  // Update the gold mine (regeneration, etc.)
  update(frameNumber) {
    // Regenerate gold slowly if not at max capacity
    if (this.goldAmount < this.maxGoldAmount) {
      this.goldAmount += this.regenerationRate;
      this.goldAmount = Math.min(this.goldAmount, this.maxGoldAmount);
    }

    // Reactivate if we have gold again
    if (this.goldAmount > 0) {
      this.isActive = true;
    }

    // Update physics (though gold mines shouldn't move)
    this.updatePhysics();

    // Update sprite
    this.render();
  }

  // Get info about this gold mine
  getInfo() {
    return {
      gold: Math.floor(this.goldAmount),
      maxGold: this.maxGoldAmount,
      percentage: Math.floor(this.getGoldPercentage() * 100),
      isActive: this.isActive,
      miners: this.minersCount,
      maxMiners: this.maxMiners,
    };
  }

  render() {
    const graphics = this.sprite;
    graphics.clear();

    const goldPercentage = this.getGoldPercentage();
    let color = 0xffd700;

    if (goldPercentage < 0.25) {
      color = 0x8b4513;
    } else if (goldPercentage < 0.5) {
      color = 0xdaa520;
    }

    graphics.beginFill(color);
    graphics.drawCircle(0, 0, this.size / 2);
    graphics.endFill();

    graphics.beginFill(goldPercentage > 0.1 ? 0xb8860b : 0x654321);
    graphics.drawCircle(0, 0, this.size / 4);
    graphics.endFill();

    if (goldPercentage < 1) {
      const barWidth = this.size;
      const barHeight = 4;
      const yOffset = -this.size / 2 - 8;

      graphics.lineStyle(1, 0x000000);
      graphics.beginFill(0x333333);
      graphics.drawRect(-barWidth / 2, yOffset, barWidth, barHeight);
      graphics.endFill();

      graphics.beginFill(0xffd700);
      graphics.drawRect(
        -barWidth / 2,
        yOffset,
        barWidth * goldPercentage,
        barHeight
      );
      graphics.endFill();
    }

    if (this.minersCount > 0) {
      graphics.lineStyle(2, 0x00ff00);
      graphics.drawCircle(0, 0, this.size / 2 + 2);
    }
  }
}
