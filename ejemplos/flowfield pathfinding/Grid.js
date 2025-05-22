/**
 * Clase que representa una cuadrícula para organizar entidades espacialmente y calcular rutas
 */
class Grid {
  /**
   * Constructor de la cuadrícula
   * @param {Object} juego - Referencia al juego principal
   * @param {number} cellSize - Tamaño de cada celda en píxeles
   */
  constructor(juego, cellSize = 50) {
    this.juego = juego;
    this.cellSize = cellSize;
    this.cols = Math.ceil(juego.ancho / cellSize);
    this.rows = Math.ceil(juego.alto / cellSize);
    this.cells = [];
    this.visible = true; // Bandera de visibilidad
    this.vectorFieldSave = {};

    // Inicializar cuadrícula con celdas vacías
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.cells.push(new Cell(x, y, cellSize, this));
      }
    }
    this.resetVectorField();
  }

  /**
   * Restablece el campo vectorial a sus valores iniciales
   */
  resetVectorField() {
    this.vectorField = this.initVectorField();
  }

  /**
   * Guarda un campo vectorial para un punto específico
   * @param {Array} vectorField - Campo vectorial a guardar
   * @param {number} x - Coordenada X del punto
   * @param {number} y - Coordenada Y del punto
   */
  saveVectorField(vectorField, x, y) {
    const cell = this.getCellAt(x, y);
    if (cell) {
      const hash = this.getCellIndex(cell.col, cell.row);
      this.vectorFieldSave[hash] = vectorField;
    }
  }

  /**
   * Obtiene un campo vectorial guardado para un punto específico
   * @param {number} x - Coordenada X del punto
   * @param {number} y - Coordenada Y del punto
   * @returns {Array|undefined} - Campo vectorial guardado o undefined
   */
  getSavedVectorField(x, y) {
    const cell = this.getCellAt(x, y);
    if (cell) {
      const hash = this.getCellIndex(cell.col, cell.row);
      const vectorField = this.vectorFieldSave[hash];
      return vectorField;
    }
  }

  /**
   * Inicializa un campo vectorial vacío
   * @returns {Array} - Campo vectorial inicializado
   */
  initVectorField() {
    const field = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        // Vector predeterminado (puede cambiarse según el comportamiento deseado)
        row.push({ x: 0, y: 0 });
      }
      field.push(row);
    }
    return field;
  }

  /**
   * Obtiene la celda en coordenadas específicas
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {Cell|null} - Celda encontrada o null
   */
  getCellAt(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null;
    }

    const index = row * this.cols + col;
    return this.cells[index];
  }

  /**
   * Obtiene el índice de una celda a partir de su posición en la cuadrícula
   * @param {number} col - Columna
   * @param {number} row - Fila
   * @returns {number} - Índice de la celda o -1 si no es válida
   */
  getCellIndex(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return -1;
    }
    return row * this.cols + col;
  }

  /**
   * Obtiene todas las entidades en una celda específica
   * @param {number} col - Columna
   * @param {number} row - Fila
   * @returns {Array} - Entidades en la celda
   */
  getEntitiesInCell(col, row) {
    const index = this.getCellIndex(col, row);
    if (index === -1) return [];
    return this.cells[index].entities;
  }

  /**
   * Obtiene todas las entidades en las celdas vecinas (incluida la celda dada)
   * @param {number} col - Columna
   * @param {number} row - Fila
   * @returns {Array} - Entidades en el vecindario
   */
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

  /**
   * Añade una entidad a la celda apropiada
   * @param {Object} entity - Entidad a añadir
   */
  addEntity(entity) {
    const cell = this.getCellAt(entity.x, entity.y);
    if (cell) {
      cell.addEntity(entity);
    }
  }

  /**
   * Actualiza la celda de una entidad cuando se mueve
   * @param {Object} entity - Entidad a actualizar
   * @param {number} oldX - Coordenada X anterior
   * @param {number} oldY - Coordenada Y anterior
   */
  updateEntity(entity, oldX, oldY) {
    const oldCell = this.getCellAt(oldX, oldY);
    const newCell = this.getCellAt(entity.x, entity.y);

    if (oldCell !== newCell) {
      if (oldCell) oldCell.removeEntity(entity);
      if (newCell) newCell.addEntity(entity);
    }
  }

  /**
   * Obtiene el vector del campo vectorial en una posición específica
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {Object} - Vector en la posición
   */
  getVectorAt(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return { x: 0, y: 0 };
    }

    return this.vectorField[row][col];
  }

  /**
   * Establece un vector en el campo vectorial
   * @param {number} col - Columna
   * @param {number} row - Fila
   * @param {Object} vector - Vector a establecer
   */
  setVector(col, row, vector) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.vectorField[row][col] = vector;
    }
  }

  /**
   * Renderiza la cuadrícula para depuración
   * @param {Object} graphics - Objeto gráfico para dibujar
   */
  render(graphics) {
    // Omitir renderizado si no es visible
    // if (!this.visible) return;
    // Solo renderizar el campo vectorial
    this.renderVectorField(this.vectorField, graphics);
  }

  /**
   * Renderiza un campo vectorial
   * @param {Array} vectorField - Campo vectorial a renderizar
   * @param {Object} graphics - Objeto gráfico para dibujar
   */
  renderVectorField(vectorField, graphics) {
    if (!vectorField || !graphics) return;
    const arrowLength = this.cellSize * 0.4; // Longitud de flecha aumentada
    graphics.lineStyle(1, 0xffffff, 0.7); // Flechas más gruesas y visibles

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row * this.cols + col];

        // Dibujar celdas bloqueadas como cuadrados blancos
        if (cell && cell.blocked) {
          graphics.beginFill(0xffffff, 0.8);
          graphics.drawRect(
            col * this.cellSize,
            row * this.cellSize,
            this.cellSize,
            this.cellSize
          );
          graphics.endFill();
          continue; // Omitir dibujo de vectores para celdas bloqueadas
        }

        const vector = vectorField[row][col];
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

        if (magnitude > 0.01) {
          // Solo dibujar si el vector tiene magnitud significativa
          const centerX = col * this.cellSize + this.cellSize / 2;
          const centerY = row * this.cellSize + this.cellSize / 2;

          const normalizedX = vector.x / magnitude;
          const normalizedY = vector.y / magnitude;

          const endX = centerX + normalizedX * arrowLength;
          const endY = centerY + normalizedY * arrowLength;

          graphics.moveTo(centerX, centerY);
          graphics.lineTo(endX, endY);

          // Añadir punta de flecha
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

  /**
   * Calcula y obtiene un campo vectorial basado en un punto objetivo
   * @param {number} pointX - Coordenada X del punto objetivo
   * @param {number} pointY - Coordenada Y del punto objetivo
   * @returns {Array} - Campo vectorial calculado
   */
  obtenerVectorField(pointX, pointY) {
    const savedVectorField = this.getSavedVectorField(pointX, pointY);
    if (savedVectorField) {
      return savedVectorField;
    }

    // Encontrar la celda que contiene el punto de clic
    const targetCol = Math.floor(pointX / this.cellSize);
    const targetRow = Math.floor(pointY / this.cellSize);
    const targetCellIndex = this.getCellIndex(targetCol, targetRow);

    if (targetCellIndex === -1) return;

    // Inicializar arrays de distancia y previo para el algoritmo de Dijkstra
    const distances = new Array(this.cells.length).fill(Infinity);
    const previous = new Array(this.cells.length).fill(null);
    const visited = new Array(this.cells.length).fill(false);

    // Cola de prioridad implementada como array por simplicidad
    // Cada elemento es [índiceCelda, distancia]
    const queue = [];

    // Comenzar con la celda objetivo (estamos calculando rutas DESDE el objetivo HACIA todas las demás celdas)
    distances[targetCellIndex] = 0;
    queue.push([targetCellIndex, 0]);

    // Algoritmo de Dijkstra
    while (queue.length > 0) {
      // Ordenar cola para obtener la celda con distancia mínima
      queue.sort((a, b) => a[1] - b[1]);

      // Obtener la celda con distancia mínima
      const [currentCellIndex, currentDistance] = queue.shift();

      // Omitir si ya procesamos esta celda
      if (visited[currentCellIndex]) continue;

      // Marcar como visitada
      visited[currentCellIndex] = true;

      const currentCell = this.cells[currentCellIndex];

      // Omitir celdas bloqueadas
      if (currentCell.blocked) continue;

      const allNeighbors = currentCell.getNeighbors();
      // Filtrar vecinos diagonales
      let neighbors = allNeighbors.filter((neighbor) => {
        // Solo permitir vecinos ortogonales (arriba, abajo, izquierda, derecha)
        return (
          Math.abs(neighbor.col - currentCell.col) +
            Math.abs(neighbor.row - currentCell.row) ===
          1
        );
      });

      //QUIERO Q SI TENGA DIAGONALES EL FLOWFIELD
      neighbors = allNeighbors;

      for (const neighbor of neighbors) {
        const neighborIndex = this.getCellIndex(neighbor.col, neighbor.row);

        // Omitir vecinos inválidos o bloqueados
        if (neighborIndex === -1 || neighbor.blocked || visited[neighborIndex])
          continue;

        // Calcular distancia (usando distancia euclidiana entre centros de celdas)
        const dx = neighbor.centerX - currentCell.centerX;
        const dy = neighbor.centerY - currentCell.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calcular nueva distancia potencial
        const newDistance = distances[currentCellIndex] + distance;

        // Si encontramos un camino más corto, actualizar la distancia y la celda anterior
        if (newDistance < distances[neighborIndex]) {
          distances[neighborIndex] = newDistance;
          previous[neighborIndex] = currentCellIndex;

          // Añadir a la cola para procesamiento
          queue.push([neighborIndex, newDistance]);
        }
      }
    }

    // Ahora crear campo vectorial basado en los caminos más cortos
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];

      // Omitir celdas bloqueadas
      if (cell.blocked) {
        this.setVector(cell.col, cell.row, { x: 0, y: 0 });
        continue;
      }

      // Omitir celdas sin camino al objetivo
      if (previous[i] === null && i !== targetCellIndex) {
        // Establecer un pequeño vector aleatorio
        this.setVector(cell.col, cell.row, {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        });
        continue;
      }

      // Para la celda objetivo misma, crear un pequeño vector aleatorio
      if (i === targetCellIndex) {
        this.setVector(cell.col, cell.row, {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        });
        continue;
      }

      // Obtener la siguiente celda en el camino hacia el objetivo
      const nextCellIndex = previous[i];
      const nextCell = this.cells[nextCellIndex];

      // Calcular dirección del vector hacia la siguiente celda
      const dx = nextCell.centerX - cell.centerX;
      const dy = nextCell.centerY - cell.centerY;

      // Normalizar el vector
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const normalizedX = dx / dist;
        const normalizedY = dy / dist;

        // Establecer fuerza del vector inversamente proporcional a la distancia del objetivo
        // pero con un valor mínimo para mantener el movimiento
        const distanceToTarget = distances[i];
        const strength = Math.max(
          0.5,
          Math.min(2.0, 200 / (distanceToTarget + 1))
        );

        this.setVector(cell.col, cell.row, {
          x: normalizedX * strength,
          y: normalizedY * strength,
        });
      }
    }
    const vectorField = JSON.parse(JSON.stringify(this.vectorField));
    this.saveVectorField(vectorField, pointX, pointY);
    this.resetVectorField();
    return vectorField;
  }
}
