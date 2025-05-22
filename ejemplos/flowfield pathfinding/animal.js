/**
 * Clase que representa un animal en el mundo del juego
 * Hereda de la clase Entidad
 */
class Animal extends Entidad {
  /**
   * Constructor de la clase Animal
   * @param {number} x - Posición inicial en el eje X
   * @param {number} y - Posición inicial en el eje Y
   * @param {Object} juego - Referencia al juego principal
   */
  constructor(x, y, juego) {
    super(x, y, juego);

    this.lado = 10;
    this.llego = false;
    this.velMax = 3;
    this.accMax = 0.6;

    this.cantidadDeCeldasDeChanguiParaLlegar = 2;

    this.numeroDeLaSuerte = Math.floor(Math.random() * 20);

    this.velocidad = {
      x: 0, // Math.random() - 0.5,
      y: 0, //Math.random() - 0.5,
    };

    this.promedioDePosicionDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioDeVelDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioPosAnimalesMuyCerca = {
      x: 0,
      y: 0,
    };
    this.animalesCerca = [];

    this.vision = window.vision ?? 100;

    this.crearGrafico();

    this.modoDebug = false;

    // Referencia a la celda actual que contiene este animal
    this.cell = null;

    // Qué tan fuertemente esta entidad es influenciada por el campo vectorial
    this.vectorFieldInfluence = window.vectorFieldInfluence ?? 1.66;
    this.numeroDeCeldasPAraMirarAlrededor =
      window.numeroDeCeldasPAraMirarAlrededor ?? 0.5;
  }

  /**
   * Crea la representación gráfica del animal
   */
  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xffffff);
    this.container.addChild(this.grafico);
  }

  /**
   * Busca otros animales cercanos y calcula sus posiciones promedio
   */
  mirarAlrededor() {
    this.promedioDePosicionDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioDeVelDeMisAmigos = {
      x: 0,
      y: 0,
    };

    this.promedioPosAnimalesMuyCerca = {
      x: 0,
      y: 0,
    };

    this.animalesCerca = [];

    // Usar cuadrícula espacial si está disponible
    if (!this.juego.grid || !this.cell) return;
    // Obtener entidades de celdas vecinas
    const nearbyEntities = this.cell.getEntitiesInNeighborhood();

    for (const otroAnimal of nearbyEntities) {
      if (this == otroAnimal) continue;

      let dist = distancia(this, otroAnimal);

      if (dist < this.vision) {
        this.animalesCerca.push(otroAnimal);
      }
    }

    //estan mas cerca:
    this.animalesMuyCerca = [];

    // Usar entidades que ya encontramos para verificar las muy cercanas
    for (const otroAnimal of this.animalesCerca) {
      if (this == otroAnimal) continue;

      let dist = distancia(this, otroAnimal);

      if (dist < this.lado * 2) {
        this.animalesMuyCerca.push(otroAnimal);
      }
    }

    if (this.animalesMuyCerca.length > 0) {
      //promedio de aniamles muy cerca
      for (const animalCerca of this.animalesMuyCerca) {
        this.promedioPosAnimalesMuyCerca.x += animalCerca.x;
        this.promedioPosAnimalesMuyCerca.y += animalCerca.y;
      }
      this.promedioPosAnimalesMuyCerca.x /= this.animalesMuyCerca.length;
      this.promedioPosAnimalesMuyCerca.y /= this.animalesMuyCerca.length;
    }

    //promedios:

    if (this.animalesCerca.length == 0) return;

    for (const animalCerca of this.animalesCerca) {
      this.promedioDePosicionDeMisAmigos.x += animalCerca.x;
      this.promedioDePosicionDeMisAmigos.y += animalCerca.y;

      this.promedioDeVelDeMisAmigos.x += animalCerca.velocidad.x;
      this.promedioDeVelDeMisAmigos.y += animalCerca.velocidad.y;
    }
    this.promedioDePosicionDeMisAmigos.x /= this.animalesCerca.length;
    this.promedioDePosicionDeMisAmigos.y /= this.animalesCerca.length;

    this.promedioDeVelDeMisAmigos.x /= this.animalesCerca.length;
    this.promedioDeVelDeMisAmigos.y /= this.animalesCerca.length;
  }

  /**
   * Aplica una fuerza hacia la posición promedio de amigos cercanos (cohesión)
   */
  irHaciaMisAmigos() {
    const dx = this.promedioDePosicionDeMisAmigos.x - this.x;
    const dy = this.promedioDePosicionDeMisAmigos.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)

    if (distancia > 0) {
      this.aplicarFuerza(
        (dx / distancia) * window.factorCohesion,
        (dy / distancia) * window.factorCohesion
      );
    }
  }

  /**
   * Aplica una fuerza para alinear la velocidad con la de los amigos cercanos
   */
  alinearmeConMisAmigos() {
    const dx = this.promedioDePosicionDeMisAmigos.x - this.x;
    const dy = this.promedioDePosicionDeMisAmigos.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)
    if (distancia > 0) {
      this.aplicarFuerza(
        this.promedioDeVelDeMisAmigos.x * window.factorAlineacion,
        this.promedioDeVelDeMisAmigos.y * window.factorAlineacion
      );
    }
  }

  /**
   * Aplica una fuerza para alejarse de animales demasiado cercanos (separación)
   */
  separarmeDeLosQueEstanBastanteCerca() {
    if (this.animalesMuyCerca.length == 0) return;
    const dx = this.promedioPosAnimalesMuyCerca.x - this.x;
    const dy = this.promedioPosAnimalesMuyCerca.y - this.y;
    const distancia = Math.hypot(dx, dy);

    if (distancia > 0) {
      // La fuerza es inversamente proporcional a la distancia
      const fuerza = window.factorSeparacion / distancia;
      this.aplicarFuerza(
        -(dx / distancia) * fuerza,
        -(dy / distancia) * fuerza
      );
    }
  }

  /**
   * Aplica una fuerza para alejarse de celdas bloqueadas en la cuadrícula
   */
  repelerDeCeldasBloqueadas() {
    if (!this.juego.grid || !this.cell) return;

    // Obtener la columna y fila de la celda actual
    const currentCol = Math.floor(this.x / this.juego.grid.cellSize);
    const currentRow = Math.floor(this.y / this.juego.grid.cellSize);

    // Verificar celdas en un radio de 3 celdas alrededor de la posición actual
    const cellRadius = this.numeroDeCeldasPAraMirarAlrededor;

    for (let rowOffset = -cellRadius; rowOffset <= cellRadius; rowOffset++) {
      for (let colOffset = -cellRadius; colOffset <= cellRadius; colOffset++) {
        const checkCol = currentCol + colOffset;
        const checkRow = currentRow + rowOffset;

        // Omitir si está fuera de los límites de la cuadrícula
        if (
          checkCol < 0 ||
          checkCol >= this.juego.grid.cols ||
          checkRow < 0 ||
          checkRow >= this.juego.grid.rows
        ) {
          continue;
        }

        // Obtener la celda en esta posición
        const cellIndex = this.juego.grid.getCellIndex(checkCol, checkRow);
        if (cellIndex === -1) continue;

        const cell = this.juego.grid.cells[cellIndex];

        // Si la celda está bloqueada, aplicar fuerza de repulsión inmediatamente
        if (cell && cell.blocked) {
          // Vector que apunta desde la celda bloqueada hacia el animal
          const dx = this.x - cell.centerX;
          const dy = this.y - cell.centerY;

          // Calcular distancia
          const distance = Math.hypot(dx, dy);
          const maxDistance =
            this.juego.grid.cellSize *
            this.numeroDeCeldasPAraMirarAlrededor *
            0.66;

          // Omitir si estamos demasiado lejos o a distancia cero
          if (distance === 0 || distance > maxDistance) continue;

          // Calcular fuerza de repulsión (más fuerte cuando está más cerca)
          // Usamos una función inversa cuadrática para que la fuerza aumente más rápidamente al acercarse

          const repulsionStrength =
            (window.factorRepulsionDeCeldasBloqueadas ?? 1.5) *
            Math.pow(maxDistance / (distance + 1), 2);

          // Aplicar fuerza normalizada
          this.aplicarFuerza(
            (dx / distance) * repulsionStrength,
            (dy / distance) * repulsionStrength
          );
        }
      }
    }
  }

  /**
   * Método llamado cuando este animal es seleccionado
   */
  heSidoSeleccionado() {
    // this.quitarTarget();
  }

  /**
   * Método llamado cuando este animal es deseleccionado
   */
  heSidoDesSeleccionado() {}

  /**
   * Actualiza el estado del animal en cada frame
   */
  update() {
    super.update();

    this.mirarAlrededor();
    this.separarmeDeLosQueEstanBastanteCerca();
    // this.irHaciaMisAmigos();
    // this.alinearmeConMisAmigos();

    this.estoySeleccionado = this.juego.selectedEntities.includes(this);
    if (this.estoySeleccionado) {
      // this.aplicarFuerzaVectorField();
    } else {
      // if (!this.target) this.queHacerSiNoTengoTarget();
    }

    //si llego..
    if (
      this.target &&
      this.currentVectorField &&
      distancia(this, this.target) <
        this.juego.grid.cellSize *
          this.cantidadDeCeldasDeChanguiParaLlegar *
          0.5
    ) {
      this.llego = true;
      this.quitarTarget();
    } else {
      this.llego = false;
    }

    //s tiene target...
    if (this.target) {
      this.irHaciaElTarget();
    }

    this.repelerDeCeldasBloqueadas();

    this.velocidad.x *= 0.7;
    this.velocidad.y *= 0.7;
  }

  /**
   * Determina qué hacer cuando el animal no tiene un objetivo asignado
   */
  queHacerSiNoTengoTarget() {
    // this.perseguirMouse();
    if (this.juego.contadorDeFrame % 300 == this.numeroDeLaSuerte) {
      const targetCell = this.juego.grid.getCellAt(
        Math.random() * this.juego.ancho,
        Math.random() * this.juego.alto
      );
      this.asignarTarget(targetCell);
    }

    this.irHaciaElTarget();
  }

  /**
   * Aplica una fuerza para moverse hacia el objetivo asignado usando el campo vectorial
   */
  irHaciaElTarget() {
    if (this.currentVectorField && this.target) {
      const cellX = Math.floor(this.x / this.juego.grid.cellSize);
      const cellY = Math.floor(this.y / this.juego.grid.cellSize);
      const vector = this.currentVectorField[cellY][cellX];
      if (vector) {
        const distanciaAlTarget = distancia(this, this.target);
        const umbral =
          this.juego.grid.cellSize * this.cantidadDeCeldasDeChanguiParaLlegar; // o el valor que prefieras

        let escala = 1;
        if (distanciaAlTarget < umbral) {
          escala = distanciaAlTarget / umbral; // se va reduciendo hasta 0
        }

        this.aplicarFuerza(
          vector.x * this.vectorFieldInfluence * escala,
          vector.y * this.vectorFieldInfluence * escala
        );
      }
    }
  }

  /**
   * Asigna un nuevo objetivo al animal y calcula su campo vectorial
   * @param {Object} que - El objetivo al que dirigirse
   */
  asignarTarget(que) {
    if (!que || !que.x || !que.y) return;
    this.target = que;
    this.llego = false;
    const vectorField = this.juego.grid.obtenerVectorField(que.x, que.y);
    this.currentVectorField = vectorField;
  }

  /**
   * Elimina el objetivo actual del animal
   */
  quitarTarget() {
    this.target = null;
    this.currentVectorField = null;
    this.velocidad.x = 0;
    this.velocidad.y = 0;
  }

  /**
   * Aplica una fuerza para perseguir al cursor del ratón
   */
  perseguirMouse() {
    const dx = this.juego.mouse.x - this.x;
    const dy = this.juego.mouse.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)
    const factor = window.factorPerseguirMouse ?? 1.1;

    if (distancia > 0) {
      this.aplicarFuerza((dx / distancia) * factor, (dy / distancia) * factor);
    }
  }

  /**
   * Renderiza el animal y sus elementos de depuración si están activados
   */
  render() {
    super.render();

    if (this.modoDebug) {
      this.grafico.rect(0, 0, this.lado, this.lado / 2).fill(0xff0000);

      this.juego.graficoDebug
        .rect(
          this.promedioDePosicionDeMisAmigos.x,
          this.promedioDePosicionDeMisAmigos.y,
          6,
          6
        )
        .fill(0x2222ff);
    }
  }
}
