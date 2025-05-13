class Grid {
  constructor(juego, cellSize = 50) {
    this.juego = juego;
    this.cellSize = cellSize;
    this.cols = Math.ceil(juego.ancho / cellSize);
    this.rows = Math.ceil(juego.alto / cellSize);
    this.cells = [];
    this.visible = true; // Add visibility flag

    // Initialize grid with empty cells
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.cells.push(new Cell(x, y, cellSize, this));
      }
    }

    // Vector field can be used for various behaviors
    this.vectorField = this.initVectorField();
  }

  initVectorField() {
    const field = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        // Default vector (can be changed based on desired field behavior)
        row.push({ x: 0, y: 0 });
      }
      field.push(row);
    }
    return field;
  }

  // Get cell at specific coordinates
  getCellAt(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null;
    }

    const index = row * this.cols + col;
    return this.cells[index];
  }

  // Get cell index from grid position
  getCellIndex(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return -1;
    }
    return row * this.cols + col;
  }

  // Get all entities in a specific cell
  getEntitiesInCell(col, row) {
    const index = this.getCellIndex(col, row);
    if (index === -1) return [];
    return this.cells[index].entities;
  }

  // Get all entities in neighboring cells (including the given cell)
  getEntitiesInNeighborhood(col, row) {
    const entities = [];

    for (
      let y = Math.max(0, row - 1);
      y <= Math.min(this.rows - 1, row + 1);
      y++
    ) {
      for (
        let x = Math.max(0, col - 1);
        x <= Math.min(this.cols - 1, col + 1);
        x++
      ) {
        entities.push(...this.getEntitiesInCell(x, y));
      }
    }

    return entities;
  }

  // Add entity to the appropriate cell
  addEntity(entity) {
    const cell = this.getCellAt(entity.x, entity.y);
    if (cell) {
      cell.addEntity(entity);
    }
  }

  // Update entity's cell when it moves
  updateEntity(entity, oldX, oldY) {
    const oldCell = this.getCellAt(oldX, oldY);
    const newCell = this.getCellAt(entity.x, entity.y);

    if (oldCell !== newCell) {
      if (oldCell) oldCell.removeEntity(entity);
      if (newCell) newCell.addEntity(entity);
    }
  }

  // Get vector from the vector field at a specific world position
  getVectorAt(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return { x: 0, y: 0 };
    }

    return this.vectorField[row][col];
  }

  // Set a vector in the vector field
  setVector(col, row, vector) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.vectorField[row][col] = vector;
    }
  }

  // Render the grid for debugging
  render(graphics) {
    // Skip rendering if not visible
    // if (!this.visible) return;

    // Only render the vector field
    this.renderVectorField(graphics);
  }
  renderVectorField(graphics) {
    const arrowLength = this.cellSize * 0.4; // Increased arrow length
    graphics.lineStyle(1, 0xffffff, 0.7); // Thicker, more visible arrows

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row * this.cols + col];

        // Draw blocked cells as white squares
        if (cell && cell.blocked) {
          graphics.beginFill(0xffffff, 0.8);
          graphics.drawRect(
            col * this.cellSize,
            row * this.cellSize,
            this.cellSize,
            this.cellSize
          );
          graphics.endFill();
          continue; // Skip drawing vectors for blocked cells
        }

        const vector = this.vectorField[row][col];
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

        if (magnitude > 0.01) {
          // Only draw if vector has significant magnitude
          const centerX = col * this.cellSize + this.cellSize / 2;
          const centerY = row * this.cellSize + this.cellSize / 2;

          const normalizedX = vector.x / magnitude;
          const normalizedY = vector.y / magnitude;

          const endX = centerX + normalizedX * arrowLength;
          const endY = centerY + normalizedY * arrowLength;

          graphics.moveTo(centerX, centerY);
          graphics.lineTo(endX, endY);

          // Add arrowhead
          const headLength = arrowLength * 0.3;
          const angle = Math.atan2(normalizedY, normalizedX);

          graphics.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
          );

          graphics.moveTo(endX, endY);

          graphics.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
          );
        }
      }
    }
    graphics.stroke({ width: 1, color: 0xffd900 });
  }
}
