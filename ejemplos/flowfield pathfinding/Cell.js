/**
 * Clase que representa una celda dentro de la cuadrícula del juego
 */
class Cell {
  /**
   * Constructor de la celda
   * @param {number} col - Columna en la cuadrícula
   * @param {number} row - Fila en la cuadrícula
   * @param {number} size - Tamaño de la celda en píxeles
   * @param {Object} grid - Referencia a la cuadrícula principal
   */
  constructor(col, row, size, grid) {
    this.col = col;
    this.row = row;
    this.size = size;
    this.grid = grid;
    this.entities = [];

    // Posición en coordenadas del mundo
    this.x = col * size;
    this.y = row * size;
    this.width = size;
    this.height = size;

    // Punto central de la celda
    this.centerX = this.x + this.width / 2;
    this.centerY = this.y + this.height / 2;
    this.blocked = Math.random() > 0.8;

    this.blockedByPeople = false;
  }

  /**
   * Añade una entidad a esta celda
   * @param {Object} entity - Entidad a añadir
   */
  addEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
      entity.cell = this;
    }
  }

  /**
   * Elimina una entidad de esta celda
   * @param {Object} entity - Entidad a eliminar
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      if (entity.cell === this) {
        entity.cell = null;
      }
    }
  }

  /**
   * Comprueba si un punto está dentro de esta celda
   * @param {number} x - Coordenada X del punto
   * @param {number} y - Coordenada Y del punto
   * @returns {boolean} - Verdadero si el punto está dentro de la celda
   */
  containsPoint(x, y) {
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height
    );
  }

  /**
   * Obtiene las celdas vecinas
   * @returns {Array} - Array de celdas vecinas
   */
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

  /**
   * Obtiene todas las entidades en esta celda y en las vecinas
   * @returns {Array} - Array con todas las entidades del vecindario
   */
  getEntitiesInNeighborhood() {
    const result = [...this.entities];
    const neighbors = this.getNeighbors();

    for (const neighbor of neighbors) {
      result.push(...neighbor.entities);
    }

    return result;
  }

  /**
   * Renderiza la celda para depuración (opcional)
   * @param {Object} graphics - Objeto gráfico para dibujar
   * @param {boolean} highlight - Si la celda debe resaltarse
   */
  render(graphics, highlight = false) {
    // Dibujar celdas bloqueadas como cuadrados blancos
    if (this.blocked) {
      graphics.beginFill(0xffffff, 0.8);
      graphics.drawRect(this.x, this.y, this.width, this.height);
      graphics.endFill();
      return;
    }

    // Solo dibujar el borde sin rellenar para celdas no bloqueadas
    if (highlight) {
      graphics.lineStyle(2, 0xff0000, 0.8);
    } else if (this.entities.length > 0) {
      // Borde más brillante para celdas con entidades
      graphics.lineStyle(
        1,
        0x00ff00,
        0.5 + Math.min(this.entities.length * 0.1, 0.5)
      );
    } else {
      graphics.lineStyle(1, 0x666666, 0.3);
    }

    graphics.drawRect(this.x, this.y, this.width, this.height);

    // No es necesario rellenar
    // No es necesario endFill ya que no estamos rellenando
  }
}
