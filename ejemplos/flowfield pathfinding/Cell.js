class Cell {
  constructor(col, row, size, grid) {
    this.col = col;
    this.row = row;
    this.size = size;
    this.grid = grid;
    this.entities = [];

    // Position in world coordinates
    this.x = col * size;
    this.y = row * size;
    this.width = size;
    this.height = size;

    // Center point of the cell
    this.centerX = this.x + this.width / 2;
    this.centerY = this.y + this.height / 2;
    this.blocked = Math.random() > 0.8;
  }

  // Add an entity to this cell
  addEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
      entity.cell = this;
    }
  }

  // Remove an entity from this cell
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      if (entity.cell === this) {
        entity.cell = null;
      }
    }
  }

  // Check if a point is inside this cell
  containsPoint(x, y) {
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height
    );
  }

  // Get neighboring cells
  getNeighbors() {
    const neighbors = [];
    const directions = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      const neighborCol = this.col + dx;
      const neighborRow = this.row + dy;
      const index = this.grid.getCellIndex(neighborCol, neighborRow);

      if (index !== -1) {
        neighbors.push(this.grid.cells[index]);
      }
    }

    return neighbors;
  }

  // Get all entities in this cell and neighboring cells
  getEntitiesInNeighborhood() {
    const result = [...this.entities];
    const neighbors = this.getNeighbors();

    for (const neighbor of neighbors) {
      result.push(...neighbor.entities);
    }

    return result;
  }

  // Render the cell for debugging (optional)
  render(graphics, highlight = false) {
    // Draw blocked cells as white squares
    if (this.blocked) {
      graphics.beginFill(0xffffff, 0.8);
      graphics.drawRect(this.x, this.y, this.width, this.height);
      graphics.endFill();
      return;
    }

    // Only draw the border without filling for non-blocked cells
    if (highlight) {
      graphics.lineStyle(2, 0xff0000, 0.8);
    } else if (this.entities.length > 0) {
      // Brighter border for cells with entities
      graphics.lineStyle(
        1,
        0x00ff00,
        0.5 + Math.min(this.entities.length * 0.1, 0.5)
      );
    } else {
      graphics.lineStyle(1, 0x666666, 0.3);
    }

    graphics.drawRect(this.x, this.y, this.width, this.height);

    // No fill needed
    // No endFill needed since we're not filling
  }
}
