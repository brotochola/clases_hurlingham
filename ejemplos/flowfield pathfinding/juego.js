class Juego {
  constructor() {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth;
    this.alto = window.innerHeight;

    this.entidades = [];
    // this.presas = [];
    // this.depredadores = [];

    this.mouse = { x: 0, y: 0 };
    this.selectionStart = null;
    this.isSelecting = false;
    this.selectionBox = null;
    this.selectedEntities = [];

    this.contadorDeFrame = 0;

    let promesa = this.app.init({ width: this.ancho, height: this.alto });

    this.ponerListeners();

    promesa.then((e) => {
      document.body.appendChild(this.app.canvas);
      window.__PIXI_APP__ = this.app;
      this.app.ticker.add(() => {
        this.gameLoop();
      });

      //el juego esta listo

      this.graficoDebug = new PIXI.Graphics();
      this.graficoDebug.name = "grafico debug";

      this.app.stage.addChild(this.graficoDebug);

      // Initialize the grid system
      this.grid = new Grid(this, 50); // 50px cell size

      // Set up initial vector field - radial pattern
      this.setupVectorField();

      for (let i = 0; i < 100; i++) {
        this.agregarAnimal(
          randomGaussBounded(this.ancho / 2, this.ancho / 2),
          randomGaussBounded(this.alto / 2, this.alto / 2)
        );
      }
    });
  }

  ponerListeners() {
    window.onmousemove = (e) => {
      this.mouse = { x: e.x, y: e.y };

      // Update selection box if we're currently selecting
      if (this.isSelecting && this.selectionBox) {
        const width = this.mouse.x - this.selectionStart.x;
        const height = this.mouse.y - this.selectionStart.y;

        this.selectionBox.clear();
        this.selectionBox.lineStyle(2, 0xffffff, 1);
        this.selectionBox.beginFill(0xffffff, 0.2);
        this.selectionBox.drawRect(
          this.selectionStart.x,
          this.selectionStart.y,
          width,
          height
        );
        this.selectionBox.endFill();
      }
    };

    // Mouse click to modify vector field
    window.oncontextmenu = (e) => {
      e.preventDefault(); // Prevent the default context menu
      if (this.grid) {
        this.updateVectorFieldBasedOnPoint(e.x, e.y);
      }
    };

    // Add mousedown event for selection
    window.onmousedown = (e) => {
      // Only proceed with selection if it's the left mouse button (button 0)
      if (e.button !== 0) {
        return;
      }
      // Start selection
      this.selectionStart = { x: e.x, y: e.y };
      this.isSelecting = true;

      // Create selection box if it doesn't exist
      if (!this.selectionBox) {
        this.selectionBox = new PIXI.Graphics();
        this.app.stage.addChild(this.selectionBox);
      }

      // Clear the selection box
      this.selectionBox.clear();

      // Clear previously selected entities
      this.selectedEntities = [];
    };

    // Add mouseup event to complete selection
    window.onmouseup = (e) => {
      if (this.isSelecting) {
        // Calculate selection rectangle
        const x1 = Math.min(this.selectionStart.x, this.mouse.x);
        const y1 = Math.min(this.selectionStart.y, this.mouse.y);
        const x2 = Math.max(this.selectionStart.x, this.mouse.x);
        const y2 = Math.max(this.selectionStart.y, this.mouse.y);

        // Find entities inside the selection rectangle
        this.selectedEntities = this.entidades.filter((entity) => {
          return (
            entity.x >= x1 && entity.x <= x2 && entity.y >= y1 && entity.y <= y2
          );
        });

        console.log(`Selected ${this.selectedEntities.length} entities`);

        // Remove the selection box from display
        if (this.selectionBox) {
          this.selectionBox.clear();
        }

        // End selection process
        this.isSelecting = false;
      }
    };
  }

  // Setup initial vector field
  setupVectorField() {
    if (!this.grid) return;

    const centerX = this.ancho / 2;
    const centerY = this.alto / 2;

    // Create a circular/radial field
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {
        const cellCenterX = col * this.grid.cellSize + this.grid.cellSize / 2;
        const cellCenterY = row * this.grid.cellSize + this.grid.cellSize / 2;

        // Vector pointing away from center
        const dx = cellCenterX - centerX;
        const dy = cellCenterY - centerY;

        // Normalize the vector
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const normalizedX = dx / dist;
          const normalizedY = dy / dist;

          // Make the vector strength inversely proportional to distance
          const strength = Math.min(1.0, 100 / dist);

          this.grid.setVector(col, row, {
            x: 0, // -Math.sin(normalizedX * 10) * strength,
            y: 0, // -normalizedY * strength,
          });
        }
      }
    }
  }
  // Update vector field to create a pathfinding flow toward the clicked point
  updateVectorFieldBasedOnPoint(pointX, pointY) {
    if (!this.grid) return;

    // Find the cell containing the click point
    const targetCol = Math.floor(pointX / this.grid.cellSize);
    const targetRow = Math.floor(pointY / this.grid.cellSize);
    const targetCellIndex = this.grid.getCellIndex(targetCol, targetRow);

    if (targetCellIndex === -1) return;

    // Initialize distance and previous arrays for Dijkstra's algorithm
    const distances = new Array(this.grid.cells.length).fill(Infinity);
    const previous = new Array(this.grid.cells.length).fill(null);
    const visited = new Array(this.grid.cells.length).fill(false);

    // Priority queue implemented as array for simplicity
    // Each element is [cellIndex, distance]
    const queue = [];

    // Start with target cell (we're calculating paths FROM the target TO all other cells)
    distances[targetCellIndex] = 0;
    queue.push([targetCellIndex, 0]);

    // Dijkstra's algorithm
    while (queue.length > 0) {
      // Sort queue to get the cell with minimum distance
      queue.sort((a, b) => a[1] - b[1]);

      // Get the cell with minimum distance
      const [currentCellIndex, currentDistance] = queue.shift();

      // Skip if we've already processed this cell
      if (visited[currentCellIndex]) continue;

      // Mark as visited
      visited[currentCellIndex] = true;

      const currentCell = this.grid.cells[currentCellIndex];

      // Skip blocked cells
      if (currentCell.blocked) continue;

      // Get all neighbors
      // Get only orthogonal neighbors (no diagonals)
      const allNeighbors = currentCell.getNeighbors();
      const neighbors = allNeighbors;
      //  const neighbors = allNeighbors.filter(
      //   (neighbor) =>
      //     (neighbor.col === currentCell.col ||
      //       neighbor.row === currentCell.row) &&
      //     !(
      //       neighbor.col === currentCell.col && neighbor.row === currentCell.row
      //     )
      // );

      for (const neighbor of neighbors) {
        const neighborIndex = this.grid.getCellIndex(
          neighbor.col,
          neighbor.row
        );

        // Skip invalid or blocked neighbors
        if (neighborIndex === -1 || neighbor.blocked || visited[neighborIndex])
          continue;

        // Calculate distance (using Euclidean distance between cell centers)
        const dx = neighbor.centerX - currentCell.centerX;
        const dy = neighbor.centerY - currentCell.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate new potential distance
        const newDistance = distances[currentCellIndex] + distance;

        // If we found a shorter path, update the distance and previous cell
        if (newDistance < distances[neighborIndex]) {
          distances[neighborIndex] = newDistance;
          previous[neighborIndex] = currentCellIndex;

          // Add to queue for processing
          queue.push([neighborIndex, newDistance]);
        }
      }
    }

    // Now create vector field based on the shortest paths
    for (let i = 0; i < this.grid.cells.length; i++) {
      const cell = this.grid.cells[i];

      // Skip blocked cells
      if (cell.blocked) {
        this.grid.setVector(cell.col, cell.row, { x: 0, y: 0 });
        continue;
      }

      // Skip cells with no path to target
      if (previous[i] === null && i !== targetCellIndex) {
        // Set a small random vector
        this.grid.setVector(cell.col, cell.row, {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        });
        continue;
      }

      // For the target cell itself, create a small random vector
      if (i === targetCellIndex) {
        this.grid.setVector(cell.col, cell.row, {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        });
        continue;
      }

      // Get the next cell in the path to the target
      const nextCellIndex = previous[i];
      const nextCell = this.grid.cells[nextCellIndex];

      // Calculate vector direction toward the next cell
      const dx = nextCell.centerX - cell.centerX;
      const dy = nextCell.centerY - cell.centerY;

      // Normalize the vector
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const normalizedX = dx / dist;
        const normalizedY = dy / dist;

        // Set vector strength inversely proportional to distance from target
        // but with a minimum value to keep movement going
        const distanceToTarget = distances[i];
        const strength = Math.max(
          0.5,
          Math.min(2.0, 200 / (distanceToTarget + 1))
        );

        this.grid.setVector(cell.col, cell.row, {
          x: normalizedX * strength,
          y: normalizedY * strength,
        });
      }
    }
  }

  gameLoop() {
    this.contadorDeFrame++;

    this.graficoDebug.clear();

    // Render the grid for debugging (only call once)
    if (this.grid) {
      this.grid.render(this.graficoDebug);
    }

    for (let entidad of this.entidades) {
      // Store old position for spatial hashing update
      const oldX = entidad.x;
      const oldY = entidad.y;

      entidad.update();

      // Update entity in grid
      if (this.grid) {
        this.grid.updateEntity(entidad, oldX, oldY);
      }
    }

    for (let entidad of this.entidades) {
      // Change color to yellow if the entity is selected
      if (this.selectedEntities.includes(entidad) && entidad.grafico) {
        entidad.grafico.clear();
        entidad.grafico
          .rect(0, 0, entidad.lado, entidad.lado / 2)
          .fill(0xffff00);
      } else if (
        entidad.grafico &&
        entidad.grafico.fill &&
        !this.selectedEntities.includes(entidad)
      ) {
        // Reset to original color if not selected
        entidad.grafico.clear();
        entidad.grafico
          .rect(0, 0, entidad.lado, entidad.lado / 2)
          .fill(0xffffff);
      }

      entidad.render();
    }
  }

  // agregarPresa(x, y) {
  //   let presa = new Presa(x, y, this);
  //   this.entidades.push(presa);
  //   this.presas.push(presa);
  // }
  // agregarDepredador(x, y) {
  //   let depre = new Depredador(x, y, this);
  //   this.entidades.push(depre);
  //   this.depredadores.push(depre);
  // }

  agregarAnimal(x, y) {
    let animal = new Animal(x, y, this);
    this.entidades.push(animal);

    // Add to spatial grid
    if (this.grid) {
      this.grid.addEntity(animal);
    }
  }
}
