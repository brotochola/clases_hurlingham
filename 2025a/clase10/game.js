import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";
import { NPC } from "./npc.js";
import { GoldMine } from "./goldMine.js";
import { Tree } from "./tree.js";
import { Home } from "./home.js";
import { UI } from "./ui.js";

export class Game {
  constructor(width = 800, height = 600) {
    window.PIXI = PIXI;
    this.mouse = {};
    this.keyboard = {};
    this.width = width;
    this.height = height;
    this.entities = [];
    this.trees = [];
    this.npcs = [];
    this.poolDeNPCs = [];
    this.goldMines = [];
    this.homes = [];
    this.isRunning = false;
    this.lastTime = 0;
    this.frameNumber = 0;
    this.app = null;

    this.initialized = false;

    this.initializePixi().then(() => {
      window.__PIXI_APP__ = this.app;
      this.initialized = true;
      console.log("Game ready for entities");
      this.addListeners();
      this.ui = new UI(this);

      this.arrancarMatter();
    });
  }

  arrancarMatter() {
    // module aliases
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

    // create an engine
    this.engine = Engine.create();
    this.engine.gravity.y = 0;

    // create runner
    this.runner = Runner.create();

    // // run the engine
    Matter.Runner.run(this.runner, this.engine);

    Matter.Events.on(this.engine, "collisionStart", (event) => {
      let pairs = event.pairs;

      for (const pair of pairs) {
        // console.log(pair.bodyA.owner, pair.bodyB.owner);
        // pair.bodyA.owner.recieveDamage(123);
        // pair.bodyB.owner.recieveDamage(123);

        pair.bodyB.owner.estoyColisionandoCon(pair.bodyA.owner);
        pair.bodyA.owner.estoyColisionandoCon(pair.bodyB.owner);
      }
    });
  }

  addListeners() {
    window.onkeydown = (event) => {
      if (!this.keyboard) this.keyboard = {};
      this.keyboard[event.key] = true;

      if (event.key === "Escape") {
        this.ui.bajar();
      }
      if (event.key === "1") {
        this.spawnNPCs(1, 1, this.mouse.x, this.mouse.y);
      }
      if (event.key === "2") {
        this.spawnNPCs(1, 2, this.mouse.x, this.mouse.y);
      }
      if (event.key === "t") {
        this.spawnTrees(1, this.mouse.x, this.mouse.y);
      }
    };

    window.onkeyup = (event) => {
      if (!this.keyboard) this.keyboard = {};
      delete this.keyboard[event.key];
    };

    this.app.canvas.onmousemove = (event) => {
      this.mouse = { x: event.x, y: event.y };
      if (this.keyboard && this.keyboard["1"]) {
        this.spawnNPCs(1, 1, event.x, event.y);
      } else if (this.keyboard && this.keyboard["2"]) {
        this.spawnNPCs(1, 2, event.x, event.y);
      }
    };

    this.app.canvas.onmousedown = (event) => {
      const entity = this.getEntityAtPosition(event.x, event.y);
      this.unselectAllEntities();
      if (entity) {
        console.log(entity);
        entity.selected = true;
        this.ui.mostrarDataDeEntidad(entity);
        // console.log(entity);
      } else {
        this.ui.bajar();
      }
    };
  }

  unselectAllEntities() {
    this.entities.forEach((entity) => {
      entity.selected = false;
    });
  }

  async initializePixi() {
    try {
      this.app = new PIXI.Application();

      await this.app.init({
        width: this.width,
        height: this.height,
        backgroundColor: 0x1099bb,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      document.body.appendChild(this.app.canvas);

      this.entityContainer = new PIXI.Container();
      this.entityContainer.name = "entityContainer";
      this.app.stage.addChild(this.entityContainer);

      this.app.ticker.add(this.gameLoop.bind(this));

      console.log("PixiJS initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PixiJS:", error);
    }
  }

  gameLoop(deltaTime) {
    const currentTime = Date.now();
    const actualDelta = this.lastTime
      ? (currentTime - this.lastTime) / 1000
      : 0;
    this.lastTime = currentTime;

    this.updateEntities(actualDelta);

    this.ui.update();

    this.frameNumber++;
  }

  updateEntities(deltaTime) {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];

      if (entity.update) {
        entity.update(this.frameNumber);
        entity.render();
      }
    }
  }

  start() {
    this.isRunning = true;
    console.log("Game started");
  }

  stop() {
    this.isRunning = false;
    this.app.ticker.stop();
    console.log("Game stopped");
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.app.renderer.resize(width, height);
  }

  getEntityAtPosition(x, y, radius = 50) {
    return this.entities.find((entity) => {
      const dx = entity.x - x;
      const dy = entity.y - y;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });
  }

  spawnNPCs(count = 1, team = 1, x, y) {
    for (let i = 0; i < count; i++) {
      const npc = new NPC(
        x || Math.random() * this.width,
        y || Math.random() * this.height,
        this,
        team
      );
      window.npc = npc;
    }
  }

  spawnGoldMines(count = 2) {
    for (let i = 0; i < count; i++) {
      const goldMine = new GoldMine(
        Math.random() * this.width,
        Math.random() * this.height,
        this
      );
    }
  }

  spawnTrees(count = 3, x, y) {
    console.log("spawnTrees", x, y);
    for (let i = 0; i < count; i++) {
      const tree = new Tree(
        x || Math.random() * this.width,
        y || Math.random() * this.height,
        this
      );
    }
  }

  spawnHomes(count = 1, team = 1, x = 0, y = 0) {
    for (let i = 0; i < count; i++) {
      const home = new Home(x, y, this, team);
    }
  }

  spawnTestLevel() {
    this.spawnNPCs(1, 1);

    this.spawnGoldMines(1);
    this.spawnTrees(1);
    this.spawnHomes(1, 1, this.width * 0.1, this.height * 0.1);
    this.spawnHomes(1, 2, this.width * 0.9, this.height * 0.9);
  }

  getEntitiesByType(type) {
    return this.entities.filter((entity) => entity.constructor.name === type);
  }

  findClosestEntity(x, y, entityType) {
    const entities = this.getEntitiesByType(entityType);
    let closest = null;
    let closestDistance = Infinity;

    entities.forEach((entity) => {
      const distance = Math.sqrt((entity.x - x) ** 2 + (entity.y - y) ** 2);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = entity;
      }
    });

    return { entity: closest, distance: closestDistance };
  }
}
