class Game {
  constructor(
    width = 1024,
    height = 768,
    canvasId = "gameCanvas",
    options = {}
  ) {
    // Game dimensions
    this.width = width;
    this.height = height;
    this.canvasId = canvasId;

    this.cellSizeFactorToHeight = 10;

    // PIXI Application
    this.app = null;
    this.mainContainer = null;
    this.gridContainer = null; // Container for grid visualization

    // Game systems
    const cellSize = options.cellSize || 16;
    const noiseFrequencies = options.noiseFrequencies || {};
    this.grid = new Grid(cellSize, noiseFrequencies, this);
    this.entities = new Set();
    this.trees = new Set();
    this.animals = new Set();
    this.plants = new Set();

    // Single graphics object for efficient rendering
    this.gridGraphics = null;

    // Game state
    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;

    // Initialize the game
    this.init();
  }

  /**
   * Initialize PIXI.js and create the main container
   */
  async init() {
    try {
      // Create PIXI Application with v8 syntax
      this.app = new PIXI.Application();

      // Initialize the application
      await this.app.init({
        width: this.width,
        height: this.height,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Add the canvas to the DOM
      const canvas = document.getElementById(this.canvasId);
      if (canvas) {
        canvas.parentNode.replaceChild(this.app.canvas, canvas);
      } else {
        document.body.appendChild(this.app.canvas);
      }

      // Create main container for all game objects
      this.mainContainer = new PIXI.Container();
      this.mainContainer.sortableChildren = true;
      this.app.stage.addChild(this.mainContainer);

      // Create grid container for terrain visualization
      this.gridContainer = new PIXI.Container();
      this.mainContainer.addChild(this.gridContainer);

      // Create single graphics object for efficient grid rendering
      this.gridGraphics = new PIXI.Graphics();
      this.gridContainer.addChild(this.gridGraphics);
      // this.gridGraphics.zIndex = 10000

      // Set up the camera (centered on the world)
      this.mainContainer.x = this.width / 2;
      this.mainContainer.y = this.height / 2;

      console.log("PIXI.js v8 initialized successfully");
      console.log(
        "Game initialized with dimensions:",
        this.width,
        "x",
        this.height
      );

      // Preload tree assets before spawning trees
      await this.preloadAssets();

      // this.spawnTrees();

      // Start the game loop
      this.start();
    } catch (error) {
      console.error("Failed to initialize PIXI.js:", error);
    }
  }

  /**
   * Preload all game assets
   */
  async preloadAssets() {
    try {
      console.log("Preloading tree assets...");

      // Define all tree image paths
      const treeAssets = [
        { alias: "tree1", src: "trees/1.png" },
        { alias: "tree2", src: "trees/2.png" },
        { alias: "tree3", src: "trees/3.png" },
        { alias: "tree4", src: "trees/4.png" },
        { alias: "tree5", src: "trees/5.png" },
      ];

      // Load all tree assets
      await PIXI.Assets.load(treeAssets);

      console.log("Tree assets preloaded successfully");
    } catch (error) {
      console.error("Failed to preload assets:", error);
    }
  }

  spawnTree(type) {
    const x = Math.random() * (app.screen.width - 100) + 50;
    const y = app.screen.height - 50;
    const tree = new LSystemTree(x, y, game, type);
  }

  spawnPlant(x, y, type) {
    const plant = new LSystemPlant(x, y, this, type);
  }
  growPlants() {
    this.entities.forEach((entity) => {
      if (entity.grow) {
        entity.grow();
      } else if (entity.regenerate) {
        entity.regenerate();
      }
    });
  }

  // spawnTrees() {
  //   // Define world bounds for tree spawning
  //   // You can adjust these values based on your desired world size
  //   const worldSize = 100; // cells in each direction from center
  //   const minCellX = -worldSize;
  //   const maxCellX = worldSize;
  //   const minCellY = -worldSize;
  //   const maxCellY = worldSize;

  //   console.log(
  //     `Spawning trees in area from (${minCellX}, ${minCellY}) to (${maxCellX}, ${maxCellY})`
  //   );

  //   // Iterate through all cells in the defined world bounds
  //   for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
  //     for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
  //       const cell = this.grid.getCell(cellX, cellY);
  //       cell.spawnTreesHere();
  //     }
  //   }

  //   console.log(`Tree spawning complete. Total trees: ${this.trees.size}`);
  // }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();

    // Use PIXI's ticker for the game loop
    this.app.ticker.add(this.gameLoop.bind(this));

    console.log("Game started");
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (!this.running) return;

    this.running = false;
    this.app.ticker.remove(this.gameLoop.bind(this));

    console.log("Game stopped");
  }

  /**
   * Main game loop
   * @param {PIXI.Ticker} ticker - PIXI ticker instance
   */
  gameLoop(ticker) {
    if (!this.running) return;

    // Calculate delta time in seconds
    this.deltaTime = ticker.deltaTime / 60; // Convert from PIXI's deltaTime to seconds

    // Update all entities
    this.entities.forEach((entity) => {
      if (entity.active) {
        entity.update(this.deltaTime);
      }
    });

    this.growPlants();

    // Custom update logic can be added here
    this.update(this.deltaTime);
  }

  /**
   * Custom update method (override in subclasses)
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    // Override this method for custom game logic
    // Update grid visualization
    this.updateGridVisualization();
  }

  /**
   * Update grid visualization based on camera position
   */
  updateGridVisualization() {
    // Clear existing grid graphics
    this.clearGridVisualization();

    // Get camera position to determine which cells to render
    const camera = this.getCameraPosition();
    const cellSize = this.grid.cellSize;

    // Calculate visible area with some padding
    const padding = cellSize * 6;
    const minX = camera.x - this.width / 2 - padding;
    const maxX = camera.x + this.width / 2 + padding;
    const minY = camera.y - this.height / 2 - padding;
    const maxY = camera.y + this.height / 2 + padding;

    // Convert to cell coordinates
    const minCellX = Math.floor(minX / cellSize);
    const maxCellX = Math.floor(maxX / cellSize);
    const minCellY = Math.floor(minY / cellSize);
    const maxCellY = Math.floor(maxY / cellSize);

    // Render visible cells from back to front (top to bottom) for proper depth sorting

    for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
        const cell = this.grid.getCell(cellX, cellY);
        this.renderCell(cell);
      }
    }
  }

  /**
   * Render a single cell with its terrain color in pseudo-isometric style
   * @param {Cell} cell - The cell to render
   */
  renderCell(cell) {
    if (!this.gridGraphics) return;

    const color = cell.getColor();
    const cellSize = cell.cellSize;
    const heightOffset = cell.z; // Scale height for visual effect

    // Convert RGB to hex for PIXI
    const hexColor = (color.r << 16) | (color.g << 8) | color.b;

    // Create darker colors for the sides (to show depth)
    const darkenFactor = 0.7;
    const sideColor =
      (Math.floor(color.r * darkenFactor) << 16) |
      (Math.floor(color.g * darkenFactor) << 8) |
      Math.floor(color.b * darkenFactor);

    // Only render height if the cell has elevation
    // if (heightOffset > 0) {
    //   // Render front face (vertical extrusion)
    //   this.gridGraphics.beginFill(sideColor);
    //   this.gridGraphics.drawRect(
    //     cell.worldX,
    //     cell.worldY - heightOffset,
    //     cellSize,
    //     heightOffset
    //   );
    //   this.gridGraphics.endFill();

    //   // Render right side face for more 3D effect
    //   this.gridGraphics.beginFill(sideColor * 0.8); // Even darker for side
    //   this.gridGraphics.drawRect(
    //     cell.worldX + cellSize,
    //     cell.worldY - heightOffset,
    //     2, // Thin side face
    //     heightOffset + cellSize
    //   );
    //   this.gridGraphics.endFill();
    // }

    // Render top face (main cell color, offset by height)
    this.gridGraphics.beginFill(hexColor);
    this.gridGraphics.drawRect(
      cell.worldX,
      cell.worldY - heightOffset,
      cellSize,
      cellSize
    );
    this.gridGraphics.endFill();

    // Add subtle border to top face
    // this.gridGraphics.lineStyle(1, 0x333333, 1);
    // this.gridGraphics.stroke(0x333333);
    // this.gridGraphics.drawRect(
    //   cell.worldX,
    //   cell.worldY - heightOffset,
    //   cellSize,
    //   cellSize
    // );

    this.gridGraphics.lineStyle(0); // Reset line style

    // Render flow direction vector if calculated
    const flowDirection = cell.getFlowDirection();
    if (flowDirection) {
      const centerX = cell.worldX + cellSize / 2;
      const centerY = cell.worldY - heightOffset + cellSize / 2;
      const vectorLength = cellSize * 0.4; // Scale vector length to cell size

      // Draw flow direction vector
      this.gridGraphics.lineStyle(2, 0x000000, 0.5); // Green, semi-transparent
      this.gridGraphics.moveTo(centerX, centerY);

      this.gridGraphics.lineTo(
        centerX + flowDirection.x * vectorLength,
        centerY + flowDirection.y * vectorLength
      );

      // Draw arrow head
      const arrowSize = 4;
      const angle = Math.atan2(cell.flowDirection.y, cell.flowDirection.x);
      this.gridGraphics.lineTo(
        centerX +
          cell.flowDirection.x * vectorLength -
          arrowSize * Math.cos(angle - Math.PI / 6),
        centerY +
          cell.flowDirection.y * vectorLength -
          arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.gridGraphics.moveTo(
        centerX + cell.flowDirection.x * vectorLength,
        centerY + cell.flowDirection.y * vectorLength
      );
      this.gridGraphics.lineTo(
        centerX +
          cell.flowDirection.x * vectorLength -
          arrowSize * Math.cos(angle + Math.PI / 6),
        centerY +
          cell.flowDirection.y * vectorLength -
          arrowSize * Math.sin(angle + Math.PI / 6)
      );
    }
  }

  /**
   * Clear all grid visualization
   */
  clearGridVisualization() {
    if (this.gridGraphics) {
      this.gridGraphics.clear();
    }
  }

  /**
   * Create a new entity at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} color - Entity color (hex)
   * @returns {Entity} The created entity
   */
  createEntity(x = 0, y = 0, color = null) {
    const entity = new Entity(x, y, this);

    if (color !== null) {
      entity.setAppearance(color);
    }

    return entity;
  }

  /**
   * Create a new tree at the specified position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} treeType - Optional tree type
   * @returns {Tree} The created tree
   */
  createTree(x = 0, y = 0, treeType = null) {
    return new Tree(x, y, this, treeType);
  }

  /**
   * Remove an entity from the game
   * @param {Entity} entity - The entity to remove
   */
  removeEntity(entity) {
    if (this.entities.has(entity)) {
      this.entities.delete(entity);
      entity.destroy();
    }
  }

  /**
   * Get all entities in the game
   * @returns {Set} Set of all entities
   */
  getAllEntities() {
    return new Set(this.entities);
  }

  /**
   * Get entities within a radius of a point
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} radius - Search radius
   * @returns {Set} Set of entities within the radius
   */
  getEntitiesInRadius(x, y, radius) {
    return this.grid.getEntitiesInRadius(x, y, radius);
  }

  /**
   * Get entities in a rectangular area
   * @param {number} x - Rectangle X coordinate
   * @param {number} y - Rectangle Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {Set} Set of entities in the area
   */
  getEntitiesInArea(x, y, width, height) {
    return this.grid.getEntitiesInArea(x, y, width, height);
  }

  /**
   * Set the camera position
   * @param {number} x - Camera X position
   * @param {number} y - Camera Y position
   */
  setCameraPosition(x, y) {
    this.mainContainer.x = this.width / 2 - x;
    this.mainContainer.y = this.height / 2 - y;
  }

  /**
   * Get the camera position
   * @returns {Object} Camera position {x, y}
   */
  getCameraPosition() {
    return {
      x: this.width / 2 - this.mainContainer.x,
      y: this.height / 2 - this.mainContainer.y,
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - Screen X coordinate
   * @param {number} screenY - Screen Y coordinate
   * @returns {Object} World coordinates {x, y}
   */
  screenToWorld(screenX, screenY) {
    const camera = this.getCameraPosition();
    return {
      x: screenX - this.width / 2 + camera.x,
      y: screenY - this.height / 2 + camera.y,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldY - World Y coordinate
   * @returns {Object} Screen coordinates {x, y}
   */
  worldToScreen(worldX, worldY) {
    const camera = this.getCameraPosition();
    return {
      x: worldX + this.width / 2 - camera.x,
      y: worldY + this.height / 2 - camera.y,
    };
  }

  /**
   * Clear all entities from the game
   */
  clearEntities() {
    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();
    this.grid.clear();
  }

  /**
   * Resize the game canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;

    if (this.app) {
      this.app.renderer.resize(width, height);

      // Update camera center
      this.mainContainer.x = width / 2;
      this.mainContainer.y = height / 2;
    }
  }

  /**
   * Get debug information about the game
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    const gridInfo = this.grid.getDebugInfo();

    return {
      running: this.running,
      dimensions: { width: this.width, height: this.height },
      entities: this.entities.size,
      activeEntities: Array.from(this.entities).filter((e) => e.active).length,
      grid: gridInfo,
      camera: this.getCameraPosition(),
      fps: this.app ? Math.round(this.app.ticker.FPS) : 0,
      deltaTime: this.deltaTime,
    };
  }

  /**
   * Destroy the game and clean up resources
   */
  destroy() {
    this.stop();
    this.clearEntities();

    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    this.mainContainer = null;
    this.grid = null;
    this.entities = null;

    console.log("Game destroyed");
  }
}
