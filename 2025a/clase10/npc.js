import { FSM } from "./fsm.js";
import { BaseEntity } from "./baseEntity.js";
import { AnimatedCharacter } from "./pixijs-animated-character-class/animated-character.js";
import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";

export class NPC extends BaseEntity {
  static STATES = {
    idle: "idle",
    goingToTree: "goingToTree",
    goingToGoldMine: "goingToGoldMine",
    choppingTree: "choppingTree",
    miningGold: "miningGold",
    attacking: "attacking",
    fleeingToBase: "fleeingToBase",
    takingResourcesBackToBase: "takingResourcesBackToBase",
    goingToEnemy: "goingToEnemy",
    dead: "dead",
  };

  static ANIMATED_SPRITES = {
    idle: "idle",
    walk: "walk",
    run: "run",
    hurt: "hurt",
    halfslash: "halfslash",
  };

  static SPRITES_DIRECTIONS = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
  };

  constructor(x, y, game, team = "team1") {
    super(x, y, game);

    this.team = team; // Team identifier for enemy detection
    this.direction = NPC.SPRITES_DIRECTIONS.down;

    // AI STUFF
    this.distanceToClosestEnemy = 100;
    this.closestEnemy = null;
    this.distanceToClosestGoldMine = 600;
    this.closestGoldMine = null;
    this.distanceToClosestTree = 200;
    this.closestTree = null;
    this.distanceToHome = Infinity;
    this.numberOfColleaguesChoppingWoodCloseToMe = 0;
    this.numberOfColleaguesMiningGoldCloseToMe = 0;
    this.numberOfColleaguesCloseToMe = 0;
    this.numberOfEnemiesCloseToMe = 0;
    this.health = 1;
    this.woodInInventory = 0;
    this.goldInInventory = 0;
    this.visionRange = 450;

    this.enemiesCloseToMe = [];

    // Death timer for delayed removal
    this.deathTimer = null;

    //limits
    this.maxItemsICanCarry = 10;
    this.minDistanceToInteract = 50;
    this.strength = Math.random() * 0.005 + 0.001;
    this.dead = false;
    // Physics properties specific to Enemy
    this.maxSpeed = 2.5;
    this.maxAcceleration = 0.23;
    this.friction = 0.9;
    this.minSpeedToShowWalkAnimation = 0.5;

    this.ready = false;
    this.fsm = new FSM(this, this.getFSMconfig());

    this.createAnimatedCharacter();
    // this.addHealthBar();

    this.crearCirculitoEnMatter();

    this.game.npcs.push(this);
  }

  crearCirculitoEnMatter() {
    this.body = Matter.Bodies.circle(this.x, this.y, 10, {
      friction: 1,
      frictionAir: 0.5,
      mass: 0.15,
    });

    this.body.owner = this;

    Matter.Composite.add(this.game.engine.world, [this.body]);
  }

  addHealthBar() {
    this.healthBar = new PIXI.Graphics();
    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(0, 0, 10, 10);
    this.healthBar.endFill();
    this.container.addChild(this.healthBar);
  }

  async createAnimatedCharacter() {
    const result = await AnimatedCharacter.CreateCharacterFromMegaSpritesheet(
      "./pixijs-animated-character-class/chabon" + this.team + ".png",
      64,
      64
    );
    this.animatedCharacter = result.character;
    this.container.addChild(result.character);
    // this.animatedCharacter.scale.set(0.5);
    this.ready = true;
  }

  getFSMconfig() {
    return {
      initialState: NPC.STATES.idle,
      globalTransitions: {
        [NPC.STATES.fleeingToBase]: () =>
          this.health <= 0.5 &&
          this.health > 0 &&
          this.distanceToHome > this.minDistanceToInteract,
        [NPC.STATES.dead]: () => this.health <= 0,

        [NPC.STATES.attacking]: () =>
          this.distanceToClosestEnemy <= this.minDistanceToInteract &&
          this.health > 0.5,
        [NPC.STATES.goingToEnemy]: () =>
          this.distanceToClosestEnemy < this.visionRange &&
          this.distanceToClosestEnemy > this.minDistanceToInteract &&
          this.health > 0.5,
      },
      states: {
        [NPC.STATES.idle]: {
          onEnter: (previousState) => {
            // console.log("on enter idle", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit idle", this.id);
          },
          onUpdate: this.onUpdateIdle.bind(this),

          transitions: {
            [NPC.STATES.goingToTree]: () =>
              this.doIHaveRoomInMyInventory() &&
              this.distanceToClosestTree > this.minDistanceToInteract &&
              this.distanceToClosestTree < this.distanceToClosestGoldMine,
            [NPC.STATES.goingToGoldMine]: () =>
              this.doIHaveRoomInMyInventory() &&
              this.distanceToClosestGoldMine > this.minDistanceToInteract &&
              this.distanceToClosestGoldMine < this.distanceToClosestTree,
            [NPC.STATES.takingResourcesBackToBase]: () =>
              this.distanceToHome > this.minDistanceToInteract &&
              !this.doIHaveRoomInMyInventory(),
          },
        },

        [NPC.STATES.choppingTree]: {
          onEnter: (previousState) => {
            // console.log("on enter chopping tree", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit chopping tree", this.id);
          },
          onUpdate: this.onUpdateChoppingTree.bind(this),
          transitions: {
            [NPC.STATES.takingResourcesBackToBase]: () =>
              !this.doIHaveRoomInMyInventory(),
            [NPC.STATES.goingToTree]: () =>
              this.distanceToClosestTree > this.minDistanceToInteract ||
              !this.closestTree.canBeChopped(),
          },
        },
        [NPC.STATES.goingToTree]: {
          onEnter: (previousState) => {
            // console.log("on enter going to tree", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit going to tree", this.id);
          },
          onUpdate: this.onUpdateGoingToTree.bind(this),
          transitions: {
            [NPC.STATES.choppingTree]: () =>
              this.distanceToClosestTree <= this.minDistanceToInteract &&
              this.closestTree &&
              this.closestTree.canBeChopped(),
            [NPC.STATES.idle]: () =>
              !this.closestTree || !this.closestTree.canBeChopped(),
          },
        },
        [NPC.STATES.miningGold]: {
          onEnter: (previousState) => {
            // console.log("on enter mining gold", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit mining gold", this.id);
          },
          onUpdate: this.onUpdateMiningGold.bind(this),
          transitions: {
            [NPC.STATES.takingResourcesBackToBase]: () =>
              !this.doIHaveRoomInMyInventory(),
            [NPC.STATES.idle]: () =>
              !this.closestGoldMine || !this.closestGoldMine.canBeMined(),
          },
        },
        [NPC.STATES.goingToGoldMine]: {
          onEnter: (previousState) => {
            // console.log("on enter going to gold mine", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit going to gold mine", this.id);
          },
          onUpdate: this.onUpdateGoingToGoldMine.bind(this),
          transitions: {
            [NPC.STATES.miningGold]: () =>
              this.distanceToClosestGoldMine <= this.minDistanceToInteract,
          },
        },
        [NPC.STATES.takingResourcesBackToBase]: {
          onEnter: (previousState) => {
            // console.log("on enter taking resources back to base", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit taking resources back to base", this.id);
            if (nextState == NPC.STATES.idle) {
              this.unloadResources();
            }
          },
          onUpdate: this.onUpdateTakingResourcesBackToBase.bind(this),
          transitions: {
            [NPC.STATES.idle]: () =>
              this.distanceToHome < this.minDistanceToInteract,
          },
        },
        [NPC.STATES.attacking]: {
          onEnter: (previousState) => {
            // console.log("on enter attacking", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit attacking", this.id);
          },
          onUpdate: this.onUpdateAttacking.bind(this),
          transitions: {
            [NPC.STATES.idle]: () =>
              this.distanceToClosestEnemy > this.visionRange,
          },
        },

        [NPC.STATES.goingToEnemy]: {
          onEnter: (previousState) => {
            // console.log("on enter going to enemy", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit going to enemy", this.id);
          },
          onUpdate: this.onUpdateGoingToEnemy.bind(this),
          transitions: {
            [NPC.STATES.attacking]: () =>
              this.closestEnemy &&
              this.distanceToClosestEnemy <= this.minDistanceToInteract,
            [NPC.STATES.idle]: () =>
              !this.closestEnemy || this.distanceToClosestEnemy == Infinity,
          },
        },

        [NPC.STATES.fleeingToBase]: {
          onEnter: (previousState) => {
            // console.log("on enter fleeing to base", this.id);
          },
          onExit: (nextState) => {
            // console.log("on exit fleeing to base", this.id);
          },
          onUpdate: this.onUpdateFleeingToBase.bind(this),
          transitions: {
            [NPC.STATES.idle]: () =>
              this.distanceToHome < this.minDistanceToInteract ||
              this.health > 0.5,
          },
        },

        [NPC.STATES.dead]: {
          onEnter: (previousState) => {
            // console.log("on enter dead", this.id);

            this.sacarCuerpoDeMatter();
            this.dead = true;
          },
          onExit: (nextState) => {
            // console.log("on exit dead", this.id);
          },
          onUpdate: this.onUpdateDead.bind(this),
          transitions: {},
        },
      },
    };
  }

  sacarCuerpoDeMatter() {
    Matter.World.remove(this.game.engine.world, this.body);
    this.body = undefined;
  }
  onUpdateIdle(frameNumber) {
    //STATE:
    // Check if enemy is nearby - switch to angry/fearful
  }

  onUpdateGoingToGoldMine() {
    // Use physics-based movement towards gold mine
    if (this.closestGoldMine) {
      this.moveTowards(this.closestGoldMine.x, this.closestGoldMine.y, 0.5);
    }
  }

  onUpdateGoingToTree() {
    // Check if current target tree is still available

    // Use physics-based movement towards tree
    if (this.closestTree) {
      this.moveTowards(this.closestTree.x, this.closestTree.y, 0.5);
    }
  }

  onUpdateChoppingTree() {
    this.woodInInventory += this.closestTree.chopWood(0.03);
  }

  onUpdateMiningGold() {
    this.goldInInventory += this.closestGoldMine.mineGold(0.1);
  }

  onUpdateTakingResourcesBackToBase() {
    // Use physics-based movement towards the home base entity
    if (this.homeBase) {
      this.moveTowards(this.homeBase.x, this.homeBase.y, 0.1);
    }
  }

  onUpdateFleeingToBase() {
    // Use physics-based movement towards the home base entity with higher urgency
    if (this.homeBase) {
      this.moveTowards(this.homeBase.x, this.homeBase.y, 0.8);
    }
    this.avoidEnemiesCloseToMe(0.7);
  }

  onUpdateGoingToEnemy() {
    // Use physics-based movement towards enemy
    if (this.closestEnemy) {
      this.moveTowards(this.closestEnemy.x, this.closestEnemy.y, 0.7);
    }
  }

  onUpdateAttacking() {
    this.closestEnemy.recieveDamage(this.strength);
  }

  onUpdateDead(frameNumber) {
    // Initialize death timer if not set
    if (!this.deathTimer) {
      this.deathTimer = 30; // 3 seconds before removal
    } else {
      // Count down the death timer using frame delta time
      // Since we don't have deltaTime here, we'll approximate it
      // Assuming ~60 FPS, each frame is approximately 1/60 seconds
      const deltaTime = 1 / 60;
      this.deathTimer -= deltaTime;

      // Remove from game when timer expires
      if (this.deathTimer <= 0) {
        this.removeFromGame();
      }
    }
  }

  doIHaveRoomInMyInventory() {
    return (
      this.goldInInventory + this.woodInInventory <= this.maxItemsICanCarry
    );
  }

  lookAround() {
    // Update all environmental awareness properties
    this.updateClosestEnemyInfo();
    this.updateClosestResourceInfo();
    this.updateDistanceToHome();
    this.updateNearbyColleaguesCount();
    this.updateNearbyEnemiesCount();
  }

  updateClosestEnemyInfo() {
    // Get all NPCs from game and filter by different team
    const allNPCs = this.game?.npcs || [];

    let closestEnemy = null;
    let shortestDistance = Infinity;

    // Find the closest NPC with a different team within vision range
    allNPCs.forEach((npc) => {
      if (
        npc !== this &&
        npc.health > 0 &&
        npc.team !== this.team &&
        !npc.dead
      ) {
        const distance = this.calculateDistance(npc.x, npc.y);
        if (distance < shortestDistance && distance <= this.visionRange) {
          shortestDistance = distance;
          closestEnemy = npc;
        }
      }
    });

    this.closestEnemy = closestEnemy;
    this.distanceToClosestEnemy = closestEnemy ? shortestDistance : Infinity;
  }

  updateClosestResourceInfo() {
    this.updateClosestGoldMineInfo();
    this.updateClosestTreeInfo();
  }

  updateClosestGoldMineInfo() {
    // Get gold mines array from game
    const goldMines = this.game?.goldMines || [];

    let closestGoldMine = null;
    let shortestDistance = Infinity;

    // Find the closest gold mine within vision range
    goldMines.forEach((goldMine) => {
      const distance = this.calculateDistance(goldMine.x, goldMine.y);
      if (
        distance < shortestDistance &&
        distance <= this.visionRange &&
        goldMine.canBeMined()
      ) {
        shortestDistance = distance;
        closestGoldMine = goldMine;
      }
    });

    this.closestGoldMine = closestGoldMine;
    this.distanceToClosestGoldMine = closestGoldMine
      ? shortestDistance
      : Infinity;
  }

  updateClosestTreeInfo() {
    // Get trees array from game
    const trees = this.game?.trees || [];

    let closestTree = null;
    let shortestDistance = Infinity;

    // Find the closest tree within vision range that can be chopped and has room
    trees.forEach((tree) => {
      const distance = this.calculateDistance(tree.x, tree.y);
      if (
        distance < shortestDistance &&
        distance <= this.visionRange &&
        tree.canBeChopped()
      ) {
        shortestDistance = distance;
        closestTree = tree;
      }
    });

    this.closestTree = closestTree;
    this.distanceToClosestTree = closestTree ? shortestDistance : Infinity;
  }

  findMyHome() {
    if (!this.game.homes.length) return;

    this.homeBase = this.game.homes.filter(
      (home) => home.team === this.team
    )[0];
  }

  updateDistanceToHome() {
    // Find the home base entity for this NPC's team
    if (!this.homeBase) this.findMyHome();
    if (!this.homeBase) return;

    this.distanceToHome = this.calculateDistance(
      this.homeBase.x,
      this.homeBase.y
    );
  }

  updateNearbyColleaguesCount() {
    // Get friendly units array from game (NPCs with same team)

    let colleaguesCloseToMe = 0;
    let colleaguesChoppingWood = 0;
    let colleaguesMiningGold = 0;
    const proximityRange = this.minDistanceToInteract * 2; // Define what "close" means

    // Count colleagues (same team) and their activities within proximity range
    this.game?.npcs.forEach((npc) => {
      if (npc !== this && npc.health > 0 && npc.team === this.team) {
        const distance = this.calculateDistance(npc.x, npc.y);
        if (distance <= proximityRange) {
          colleaguesCloseToMe++;

          // Check what they're doing based on their FSM state
          if (npc.fsm?.currentState === NPC.STATES.choppingTree) {
            colleaguesChoppingWood++;
          } else if (npc.fsm?.currentState === NPC.STATES.miningGold) {
            colleaguesMiningGold++;
          }
        }
      }
    });

    this.numberOfColleaguesCloseToMe = colleaguesCloseToMe;
    this.numberOfColleaguesChoppingWoodCloseToMe = colleaguesChoppingWood;
    this.numberOfColleaguesMiningGoldCloseToMe = colleaguesMiningGold;
  }

  avoidEnemiesCloseToMe(factor = 2) {
    if (this.enemiesCloseToMe.length == 0) return;
    let avgX = 0;
    let avgY = 0;

    // Calculate average position of nearby enemies
    this.enemiesCloseToMe.forEach((enemy) => {
      avgX += enemy.x;
      avgY += enemy.y;
    });

    avgX /= this.enemiesCloseToMe.length;
    avgY /= this.enemiesCloseToMe.length;

    // Calculate direction vector from average position to this NPC
    const dx = this.x - avgX;
    const dy = this.y - avgY;

    // Normalize the direction vector
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      const normalizedDx = dx / length;
      const normalizedDy = dy / length;

      this.applyForce({
        x: normalizedDx * factor,
        y: normalizedDy * factor,
      });
    }
  }

  updateNearbyEnemiesCount() {
    // Get all NPCs from game and filter by different team
    const allNPCs = this.game?.npcs || [];
    this.enemiesCloseToMe = [];

    let enemiesCloseToMe = 0;

    // Count enemies (different team) within proximity range
    allNPCs.forEach((npc) => {
      if (
        npc !== this &&
        npc.health > 0 &&
        npc.team !== this.team &&
        !npc.dead
      ) {
        const distance = this.calculateDistance(npc.x, npc.y);
        if (distance <= this.visionRange) {
          enemiesCloseToMe++;
          this.enemiesCloseToMe.push(npc);
        }
      }
    });

    this.numberOfEnemiesCloseToMe = enemiesCloseToMe;
  }

  updateStats() {
    if (this.dead) return;
    //update stats
    this.health += 0.0002;
    this.health = Math.min(this.health, 1);
    this.angle = this.getMovementAngle();
  }
  recieveDamage(damage) {
    this.health -= damage;
  }

  calculateSpriteDirection() {
    // Determine direction based on velocity angle
    // Normalize angle to 0-360 degrees
    let normalizedAngle =
      ((this.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let degrees = normalizedAngle * (180 / Math.PI);

    let direction;
    if (degrees >= 315 || degrees < 45) {
      direction = NPC.SPRITES_DIRECTIONS.right;
    } else if (degrees >= 45 && degrees < 135) {
      direction = NPC.SPRITES_DIRECTIONS.down;
    } else if (degrees >= 135 && degrees < 225) {
      direction = NPC.SPRITES_DIRECTIONS.left;
    } else {
      // 225 to 315
      direction = NPC.SPRITES_DIRECTIONS.up;
    }
    return direction;
  }

  calculateSpriteAction() {
    // Determine animated sprite based on current FSM state
    let animatedSprite;
    const currentState = this.fsm.currentState;
    const speed = this.getSpeed();
    const limit = this.maxSpeed * 0.8;

    if (speed > this.minSpeedToShowWalkAnimation && speed < limit) {
      return NPC.ANIMATED_SPRITES.walk;
    } else if (speed > limit) {
      return NPC.ANIMATED_SPRITES.run;
    } else if (currentState == NPC.STATES.dead) {
      return NPC.ANIMATED_SPRITES.hurt;
    } else if (
      currentState == NPC.STATES.attacking ||
      currentState == NPC.STATES.choppingTree ||
      currentState == NPC.STATES.miningGold
    ) {
      return NPC.ANIMATED_SPRITES.halfslash;
    } else if (currentState == NPC.STATES.idle) {
      return NPC.ANIMATED_SPRITES.idle;
    }
  }

  render() {
    if (!this.addedToGame || !this.ready) return;
    const action = this.calculateSpriteAction();
    const direction = this.calculateSpriteDirection();

    // console.log(this.id, action, direction);

    if (direction && action) {
      this.animatedCharacter.changeAnimation(action, direction, {
        loop: action != NPC.ANIMATED_SPRITES.hurt,
      });
    }

    if (this.getSpeed() > this.minSpeedToShowWalkAnimation) {
      this.animatedCharacter.animationSpeed = this.getSpeed() * 0.1;
    }

    // Update health bar
    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.healthBar) return;

    // Clear previous graphics
    this.healthBar.clear();

    // Health bar dimensions
    const maxWidth = 40;
    const height = 6;
    const currentWidth = Math.max(0, this.health * maxWidth);

    // Position above the character
    this.healthBar.x = -maxWidth / 2;
    this.healthBar.y = -40;

    // Background (darker outline)
    this.healthBar.beginFill(0x000000, 0.8);
    this.healthBar.drawRect(0, 0, maxWidth, height);
    this.healthBar.endFill();

    // Determine health bar color based on health percentage
    let healthColor;
    if (this.health > 0.7) {
      healthColor = 0x00ff00; // Green for healthy
    } else if (this.health > 0.3) {
      healthColor = 0xffff00; // Yellow for medium health
    } else {
      healthColor = 0xff0000; // Red for low health
    }

    // Draw current health
    if (currentWidth > 0) {
      this.healthBar.beginFill(healthColor);
      this.healthBar.drawRect(0, 0, currentWidth, height);
      this.healthBar.endFill();
    }

    // Hide health bar if at full health (optional - remove this block if you want it always visible)
    // this.healthBar.visible = this.health < 1.0;
  }

  update(frameNumber) {
    if (!this.addedToGame || !this.ready) return;
    this.conQuienEstoyColisionando = null;
    // Update physics first
    this.updatePhysics();

    // Look around to update environmental awareness
    this.lookAround();

    //separation (apply before FSM so it doesn't get overridden)
    if (!this.dead) this.separation();

    this.updateStats();

    this.fsm.update(frameNumber);

    // this.render();
  }

  unloadResources() {
    this.homeBase.depositResources(this.woodInInventory, this.goldInInventory);
    this.woodInInventory = 0;
    this.goldInInventory = 0;
  }

  separation() {
    // Implements boids separation rule to avoid crowding with other NPCs
    const allNPCs = this.game?.npcs || [];
    let separationForceX = 0;
    let separationForceY = 0;
    let count = 0;

    // Check all NPCs for separation
    allNPCs.forEach((npc) => {
      if (npc !== this && npc.health > 0) {
        const distance = this.calculateDistance(npc.x, npc.y);

        // Apply separation if NPC is too close
        if (distance < this.minDistanceToInteract && distance > 0) {
          // Calculate direction away from the other NPC
          const dx = this.x - npc.x;
          const dy = this.y - npc.y;

          // Normalize the direction vector
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          // Separation force is stronger when NPCs are closer
          const separationStrength =
            (this.minDistanceToInteract - distance) /
            this.minDistanceToInteract;

          // Add to separation force
          separationForceX += normalizedDx * separationStrength;
          separationForceY += normalizedDy * separationStrength;
          count++;
        }
      }
    });

    // Average the separation forces if there are nearby NPCs
    if (count > 0) {
      separationForceX /= count;
      separationForceY /= count;
      const factor = 0.5;

      this.applyForce({
        x: separationForceX * factor,
        y: separationForceY * factor,
      });
    }
  }

  estoyColisionandoCon(conQuien) {
    this.conQuienEstoyColisionando = conQuien;
  }
}
