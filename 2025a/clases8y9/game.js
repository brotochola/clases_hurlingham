import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";
import { NPC } from "./npc.js";
import { GoldMine } from "./goldMine.js";
import { Tree } from "./tree.js";
import { Home } from "./home.js";
import { UI } from "./ui.js";
export class Game {
  constructor(width = 800, height = 600) {
    window.PIXI = PIXI;
    this.width = width;
    this.height = height;
    this.entities = [];
    this.trees = [];
    this.npcs = [];
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
    });
  }

  addListeners() {
    this.app.canvas.onmousedown = (event) => {
      const entity = this.getEntityAtPosition(event.x, event.y);
      this.unselectAllEntities();
      if (entity) {
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

  spawnNPCs(count = 1, team = 1) {
    for (let i = 0; i < count; i++) {
      const npc = new NPC(
        Math.random() * this.width,
        Math.random() * this.height,
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

  spawnTrees(count = 3) {
    for (let i = 0; i < count; i++) {
      const tree = new Tree(
        Math.random() * this.width,
        Math.random() * this.height,
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
    this.spawnNPCs(10, 1);

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
