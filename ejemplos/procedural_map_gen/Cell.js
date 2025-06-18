class Cell {
  constructor(x, y, cellSize = 64, grid) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.entities = new Set(); // Use Set for O(1) add/remove operations

    // Optional: Visual representation for debugging
    this.worldX = x * cellSize;
    this.worldY = y * cellSize;

    // Generate terrain properties using Perlin noise
    // Use frequencies from the grid configuration
    const soilScale = x * this.grid.noiseFrequencies.soilFertility;
    const heightScale = x * this.grid.noiseFrequencies.height;
    const temperatureScale = x * this.grid.noiseFrequencies.temperature;

    const soilScaleY = y * this.grid.noiseFrequencies.soilFertility;
    const heightScaleY = y * this.grid.noiseFrequencies.height;
    const temperatureScaleY = y * this.grid.noiseFrequencies.temperature;

    // Generate properties using different noise generators and frequencies
    this.soilFertility = this.grid.soilNoiseGenerator.noise(
      soilScale,
      soilScaleY
    );
    this.height = this.grid.heightNoiseGenerator.noise(
      heightScale,
      heightScaleY
    );
    this.temperature = this.grid.temperatureNoiseGenerator.noise(
      temperatureScale,
      temperatureScaleY
    );

    this.z = 0; //this.height * cellSize * this.grid.game.cellSizeFactorToHeight;

    this.water = this.height < 0.4;
    this.beach = this.height > 0.4 && this.height < 0.45;
    this.frozen = this.temperature < 0.3;
    this.desert = this.temperature > 0.7;

    // Flow direction vector - points to the neighboring cell with lowest height (using Victor.js)
    this.flowDirection = new Victor(0, 0);
    this.flowDirectionCalculated = false;

    this.spawnTreesHere();
  }

  spawnTreesHere() {
    if (this.water) return;

    // Define tree types to consider
    const treeTypes = Tree.types;

    // Calculate spawn chances for each tree type
    const treeChances = [];
    for (const treeType of treeTypes) {
      const chance = this.calculateTreeSpawnChance(
        this.height,
        this.soilFertility,
        this.temperature,
        treeType
      );
      if (chance > 0) {
        treeChances.push({ type: treeType, chance: chance });
      }
    }

    // If no trees can grow here, return
    if (treeChances.length === 0) return;

    // Sort by chance (highest first) and try to spawn trees
    treeChances.sort((a, b) => b.chance - a.chance);

    // Try to spawn up to 2 trees per cell
    let treesSpawned = 0;
    const maxTrees = 2;

    for (const treeData of treeChances) {
      if (treesSpawned >= maxTrees) break;

      if (Math.random() < treeData.chance * 1) {
        const tree = this.grid.game.createTree(
          this.worldX + this.cellSize * Math.random(),
          this.worldY + this.cellSize * Math.random(),
          treeData.type
        );
        treesSpawned++;
      }
    }
  }

  /**
   * Calculate the probability of spawning a specific tree type based on terrain properties
   * @param {number} height - Height value (0-1)
   * @param {number} soilFertility - Soil fertility value (0-1)
   * @param {number} temperature - Temperature value (0-1)
   * @param {string} treeType - Type of tree ("oak", "pine", "palm", "birch", "maple")
   * @returns {number} Spawn chance between 0 and 1
   */
  calculateTreeSpawnChance(height, soilFertility, temperature, treeType) {
    // Define optimal conditions for each tree type
    const treePreferences = {
      oak: {
        heightMin: 0.4,
        heightMax: 0.7,
        heightOptimal: 0.55,
        soilMin: 0.4,
        soilMax: 0.7,
        soilOptimal: 0.55,
        tempMin: 0.4,
        tempMax: 0.7,
        tempOptimal: 0.55,
      },
      pine: {
        heightMin: 0.5,
        heightMax: 0.8,
        heightOptimal: 0.65,
        soilMin: 0.5,
        soilMax: 0.8,
        soilOptimal: 0.65,
        tempMin: 0.5,
        tempMax: 0.8,
        tempOptimal: 0.65,
      },
      palm: {
        heightMin: 0.45,
        heightMax: 0.75,
        heightOptimal: 0.6,
        soilMin: 0.45,
        soilMax: 0.75,
        soilOptimal: 0.6,
        tempMin: 0.45,
        tempMax: 0.75,
        tempOptimal: 0.6,
      },
      birch: {
        heightMin: 0.4,
        heightMax: 1,
        heightOptimal: 0.6,
        soilMin: 0.2,
        soilMax: 0.6,
        soilOptimal: 0.4,
        tempMin: 0.6,
        tempMax: 0.85,
        tempOptimal: 0.725,
      },
      maple: {
        heightMin: 0.6,
        heightMax: 0.85,
        heightOptimal: 0.6,
        soilMin: 0.5,
        soilMax: 0.9,
        soilOptimal: 0.7,
        tempMin: 0.1,
        tempMax: 0.4,
        tempOptimal: 0.25,
      },
    };

    // Get preferences for the specified tree type
    const prefs = treePreferences[treeType];
    if (!prefs) {
      console.warn(`Unknown tree type: ${treeType}`);
      return 0;
    }

    // Calculate fitness for each property (0-1 where 1 is optimal)
    const heightFitness = this.calculatePropertyFitness(
      height,
      prefs.heightMin,
      prefs.heightMax,
      prefs.heightOptimal
    );
    const soilFitness = this.calculatePropertyFitness(
      soilFertility,
      prefs.soilMin,
      prefs.soilMax,
      prefs.soilOptimal
    );
    const tempFitness = this.calculatePropertyFitness(
      temperature,
      prefs.tempMin,
      prefs.tempMax,
      prefs.tempOptimal
    );

    // Combined fitness (multiply all factors - all must be decent for tree to grow)
    const combinedFitness = heightFitness * soilFitness * tempFitness;

    // Apply a base spawn rate modifier (adjust this to control overall tree density)
    const baseSpawnRate = 0.3;

    return combinedFitness * baseSpawnRate;
  }

  /**
   * Calculate how well a property value fits within the preferred range
   * @param {number} value - The actual value
   * @param {number} min - Minimum acceptable value
   * @param {number} max - Maximum acceptable value
   * @param {number} optimal - Optimal value within the range
   * @returns {number} Fitness value between 0 and 1
   */
  calculatePropertyFitness(value, min, max, optimal) {
    // If outside acceptable range, return 0
    if (value < min || value > max) {
      return 0;
    }

    // Calculate distance from optimal value
    const distanceFromOptimal = Math.abs(value - optimal);
    const maxDistance = Math.max(optimal - min, max - optimal);

    // Convert distance to fitness (closer to optimal = higher fitness)
    const fitness = 1 - distanceFromOptimal / maxDistance;

    return Math.max(0, fitness);
  }

  /**
   * Add an entity to this cell
   * @param {Entity} entity - The entity to add
   */
  addEntity(entity) {
    this.entities.add(entity);
  }

  /**
   * Remove an entity from this cell
   * @param {Entity} entity - The entity to remove
   */
  removeEntity(entity) {
    this.entities.delete(entity);
  }

  /**
   * Get all entities in this cell
   * @returns {Set} Set of entities
   */
  getEntities() {
    return this.entities;
  }

  /**
   * Check if this cell contains any entities
   * @returns {boolean}
   */
  isEmpty() {
    return this.entities.size === 0;
  }

  /**
   * Get the number of entities in this cell
   * @returns {number}
   */
  getEntityCount() {
    return this.entities.size;
  }

  /**
   * Clear all entities from this cell
   */
  clear() {
    this.entities.clear();
  }

  /**
   * Get the RGB color based on terrain properties
   * Red mapped to temperature, Blue mapped to height, Green mapped to fertility
   * @returns {Object} Object with r, g, b properties (0-255)
   */
  getColor() {
    if (this.water) {
      return {
        r: 0,
        g: 0,
        b: 255,
      };
    }

    if (this.beach) {
      return {
        r: 255,
        g: 255,
        b: 0,
      };
    }

    if (this.frozen) {
      return {
        r: 240,
        g: 240,
        b: 240,
      };
    }

    if (this.desert) {
      return {
        r: 200,
        g: 200,
        b: 0,
      };
    }

    return {
      r: Math.floor(this.temperature * 255),
      g: Math.floor(this.soilFertility * 255),
      b: Math.floor(this.height * 255),
    };
  }

  /**
   * Get the color as a CSS RGB string
   * @returns {string} CSS rgb string like "rgb(255, 128, 64)"
   */
  getColorString() {
    const color = this.getColor();
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
   * Get the color as a hexadecimal string
   * @returns {string} Hex color string like "#ff8040"
   */
  getColorHex() {
    const color = this.getColor();
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  /**
   * Get all neighboring cells (8-directional)
   * @returns {Array} Array of neighboring cells that exist
   */
  getNeighbors() {
    return this.getNeighborsInRadius(1);
  }

  /**
   * Get all neighboring cells within N cells radius
   * @param {number} radius - The radius to search for neighbors (1 = immediate neighbors, 2 = 2 cells away, etc.)
   * @returns {Array} Array of neighboring cells that exist within the radius
   */
  getNeighborsInRadius(radius) {
    if (!this.neighborsInRadius) {
      this.neighborsInRadius = {};
    }

    if (this.neighborsInRadius[radius]) {
      return this.neighborsInRadius[radius];
    }

    const neighbors = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Skip the center cell (self)
        if (dx === 0 && dy === 0) continue;

        const neighborX = this.x + dx;
        const neighborY = this.y + dy;

        // Check if this neighbor exists in the grid
        const neighborKey = this.grid.getCellKey(neighborX, neighborY);
        if (this.grid.cells[neighborKey]) {
          neighbors.push(this.grid.cells[neighborKey]);
        }
      }
    }

    this.neighborsInRadius[radius] = neighbors;

    return neighbors;
  }

  /**
   * Calculate the flow direction vector pointing to the lowest cell within 5 cells radius
   * @returns {Victor} Flow direction vector
   */
  calculateFlowDirection() {
    const neighbors = this.getNeighborsInRadius(3);

    // Calculate flow direction based on height differences with all neighbors
    const flowVector = new Victor(0, 0);

    for (const neighbor of neighbors) {
      const heightDifference = this.height - neighbor.height; // How much higher we are than the neighbor

      // Neighbor is lower - flow towards it
      const dx = neighbor.x - this.x;
      const dy = neighbor.y - this.y;
      const directionToNeighbor = new Victor(dx, dy).normalize();
      const flowContribution =
        directionToNeighbor.multiplyScalar(heightDifference);
      flowVector.add(flowContribution);

      // If neighbor is higher or same height, no flow towards it
    }

    // Normalize the resulting flow vector
    if (flowVector.magnitude() > 0) {
      this.flowDirection = flowVector.normalize();
    } else {
      this.flowDirection = new Victor(0, 0);
    }

    return this.flowDirection;
  }

  /**
   * Get the flow direction vector, calculating it if not already done
   * @returns {Victor} Flow direction vector
   */
  getFlowDirection() {
    if (!this.flowDirectionCalculated) {
      this.flowDirection = this.calculateFlowDirection();
      this.flowDirectionCalculated = true;
    }
    return this.flowDirection;
  }

  /**
   * Force recalculation of flow direction (useful when terrain changes)
   */
  recalculateFlowDirection() {
    this.flowDirection = this.calculateFlowDirection();
    this.flowDirectionCalculated = true;
  }
}
