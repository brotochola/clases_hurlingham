class Grid {
  constructor(cellSize = 64, noiseFrequencies = {}, game) {
    this.game = game;
    this.cellSize = cellSize;
    this.cells = {}; // Hash map to store cells

    // Flow field visualization toggle
    this.showFlowField = false;

    // Set default noise frequencies (higher = more detailed/frequent changes)
    this.noiseFrequencies = {
      soilFertility: noiseFrequencies.soilFertility,
      height: noiseFrequencies.height, // Lower frequency for larger terrain features
      temperature: noiseFrequencies.temperature, // Higher frequency for more varied temperature zones
      ...noiseFrequencies, // Allow overriding any of the above
    };

    // Create noise generators for different properties
    this.soilNoiseGenerator = new PerlinNoise(123);
    this.heightNoiseGenerator = new PerlinNoise(456);
    this.temperatureNoiseGenerator = new PerlinNoise(789);
  }

  /**
   * Generate hash key for cell coordinates
   * @param {number} cellX - Cell X coordinate
   * @param {number} cellY - Cell Y coordinate
   * @returns {string} Hash key in format 'x_10_y_29'
   */
  getCellKey(cellX, cellY) {
    return `x_${cellX}_y_${cellY}`;
  }

  /**
   * Convert world coordinates to cell coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldY - World Y coordinate
   * @returns {Object} Object with cellX and cellY properties
   */
  worldToCell(worldX, worldY) {
    return {
      cellX: Math.floor(worldX / this.cellSize),
      cellY: Math.floor(worldY / this.cellSize),
    };
  }

  /**
   * Get or create a cell at the specified coordinates
   * @param {number} cellX - Cell X coordinate
   * @param {number} cellY - Cell Y coordinate
   * @returns {Cell} The cell at the specified coordinates
   */
  getCell(cellX, cellY) {
    const key = this.getCellKey(cellX, cellY);

    if (!this.cells[key]) {
      this.cells[key] = new Cell(cellX, cellY, this.cellSize, this);
    }

    return this.cells[key];
  }

  /**
   * Get cell at world coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldY - World Y coordinate
   * @returns {Cell} The cell containing the world coordinates
   */
  getCellAtWorldPos(worldX, worldY) {
    const { cellX, cellY } = this.worldToCell(worldX, worldY);
    return this.getCell(cellX, cellY);
  }

  /**
   * Add an entity to the appropriate cell based on its position
   * @param {Entity} entity - The entity to add
   */
  addEntity(entity) {
    const cell = this.getCellAtWorldPos(entity.position.x, entity.position.y);
    cell.addEntity(entity);
    entity.currentCell = cell;
  }

  /**
   * Remove an entity from its current cell
   * @param {Entity} entity - The entity to remove
   */
  removeEntity(entity) {
    if (entity.currentCell) {
      entity.currentCell.removeEntity(entity);
      entity.currentCell = null;
    }
  }

  /**
   * Update an entity's cell based on its current position
   * @param {Entity} entity - The entity to update
   */
  updateEntity(entity) {
    const newCell = this.getCellAtWorldPos(
      entity.position.x,
      entity.position.y
    );

    // Only update if the entity moved to a different cell
    if (entity.currentCell !== newCell) {
      if (entity.currentCell) {
        entity.currentCell.removeEntity(entity);
      }
      newCell.addEntity(entity);
      entity.currentCell = newCell;
    }
  }

  /**
   * Get all entities within a radius of a point
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} radius - Search radius
   * @returns {Set} Set of entities within the radius
   */
  getEntitiesInRadius(centerX, centerY, radius) {
    const entities = new Set();

    // Calculate which cells we need to check
    const minCellX = Math.floor((centerX - radius) / this.cellSize);
    const maxCellX = Math.floor((centerX + radius) / this.cellSize);
    const minCellY = Math.floor((centerY - radius) / this.cellSize);
    const maxCellY = Math.floor((centerY + radius) / this.cellSize);

    // Check all cells in the range
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = this.getCellKey(cellX, cellY);
        const cell = this.cells[key];

        if (cell) {
          // Check each entity's actual distance
          cell.getEntities().forEach((entity) => {
            const dx = entity.position.x - centerX;
            const dy = entity.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
              entities.add(entity);
            }
          });
        }
      }
    }

    return entities;
  }

  /**
   * Get all entities in a rectangular area
   * @param {number} x - Rectangle X coordinate
   * @param {number} y - Rectangle Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {Set} Set of entities in the area
   */
  getEntitiesInArea(x, y, width, height) {
    const entities = new Set();

    const minCellX = Math.floor(x / this.cellSize);
    const maxCellX = Math.floor((x + width) / this.cellSize);
    const minCellY = Math.floor(y / this.cellSize);
    const maxCellY = Math.floor((y + height) / this.cellSize);

    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = this.getCellKey(cellX, cellY);
        const cell = this.cells[key];

        if (cell) {
          cell.getEntities().forEach((entity) => {
            // Check if entity is actually within the rectangle
            if (
              entity.position.x >= x &&
              entity.position.x <= x + width &&
              entity.position.y >= y &&
              entity.position.y <= y + height
            ) {
              entities.add(entity);
            }
          });
        }
      }
    }

    return entities;
  }

  /**
   * Clear all entities from the grid
   */
  clear() {
    Object.values(this.cells).forEach((cell) => cell.clear());
    this.cells = {};
  }

  /**
   * Get debug info about the grid
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    const cellKeys = Object.keys(this.cells);
    const totalEntities = Object.values(this.cells).reduce(
      (sum, cell) => sum + cell.getEntityCount(),
      0
    );

    return {
      totalCells: cellKeys.length,
      totalEntities: totalEntities,
      cellSize: this.cellSize,
      cells: this.cells,
    };
  }
}
