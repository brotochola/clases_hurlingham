/**
 * Clase principal que maneja el juego, las entidades y la interfaz de usuario
 */
class Juego {
  /**
   * Constructor del juego
   */
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

      // Inicializar el sistema de cuadrícula
      this.grid = new Grid(this, 50); // Tamaño de celda 50px

      // Configurar campo vectorial inicial - patrón radial
      this.setupVectorField();

      for (let i = 0; i < 100; i++) {
        this.agregarAnimal(
          randomGaussBounded(this.ancho / 2, this.ancho / 2),
          randomGaussBounded(this.alto / 2, this.alto / 2)
        );
      }
    });
  }

  /**
   * Configura los listeners de eventos del ratón
   */
  ponerListeners() {
    window.onmousemove = (e) => {
      this.mouse = { x: e.x, y: e.y };

      // Actualizar caja de selección si estamos seleccionando
      if (this.isSelecting && this.selectionBox) {
        const width = Math.abs(this.mouse.x - this.selectionStart.x);
        const height = Math.abs(this.mouse.y - this.selectionStart.y);

        const startX = Math.min(this.selectionStart.x, this.mouse.x);
        const startY = Math.min(this.selectionStart.y, this.mouse.y);

        this.selectionBox.clear();
        this.selectionBox.lineStyle(2, 0xffffff, 1);
        this.selectionBox.beginFill(0xffffff, 0.2);
        this.selectionBox.drawRect(startX, startY, width, height);
        this.selectionBox.endFill();
      }
    };

    // Clic con ratón para modificar campo vectorial
    window.oncontextmenu = (e) => {
      e.preventDefault(); // Prevenir el menú contextual predeterminado

      const cell = this.grid.getCellAt(e.x, e.y);

      if (this.selectedEntities.length > 0) {
        // Asignar el objetivo a las entidades previamente seleccionadas
        for (let entidad of this.selectedEntities) {
          entidad.asignarTarget(cell);
        }
      }
    };

    // Añadir evento mousedown para selección
    window.onmousedown = (e) => {
      // Solo proceder con selección si es el botón izquierdo del ratón (botón 0)
      if (e.button !== 0) {
        return;
      }
      // Iniciar selección
      this.selectionStart = { x: e.x, y: e.y };
      this.isSelecting = true;

      // Crear caja de selección si no existe
      if (!this.selectionBox) {
        this.selectionBox = new PIXI.Graphics();
        this.app.stage.addChild(this.selectionBox);
      }

      // Limpiar la caja de selección
      this.selectionBox.clear();
    };

    // Añadir evento mouseup para completar selección
    window.onmouseup = (e) => {
      if (this.isSelecting) {
        // Calcular rectángulo de selección
        const x1 = Math.min(this.selectionStart.x, this.mouse.x);
        const y1 = Math.min(this.selectionStart.y, this.mouse.y);
        const x2 = Math.max(this.selectionStart.x, this.mouse.x);
        const y2 = Math.max(this.selectionStart.y, this.mouse.y);

        // Guardar las entidades seleccionadas anteriormente
        const prevSelectedEntities = [...this.selectedEntities];

        console.log("prevSelectedEntities", prevSelectedEntities);

        // Encontrar entidades dentro del rectángulo de selección
        this.selectedEntities = this.entidades.filter((entity) => {
          return (
            entity.x >= x1 && entity.x <= x2 && entity.y >= y1 && entity.y <= y2
          );
        });

        // Llamar heSidoSeleccionado en las entidades recién seleccionadas
        this.selectedEntities.forEach((entidad) => {
          entidad.heSidoSeleccionado();
        });

        console.log("selectedEntities", this.selectedEntities);
        // Encontrar entidades que estaban seleccionadas y ahora no
        prevSelectedEntities.forEach((entidad) => {
          if (!this.selectedEntities.includes(entidad)) {
            // Esta entidad ha sido deseleccionada

            entidad.heSidoDesSeleccionado();
          }
        });

        console.log(`Seleccionadas ${this.selectedEntities.length} entidades`);

        // Eliminar la caja de selección de la pantalla
        if (this.selectionBox) {
          this.selectionBox.clear();
        }

        // Finalizar proceso de selección
        this.isSelecting = false;
      }
    };
  }

  /**
   * Configura el campo vectorial inicial
   */
  setupVectorField() {
    if (!this.grid) return;

    const centerX = this.ancho / 2;
    const centerY = this.alto / 2;

    // Crear un campo circular/radial
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {
        const cellCenterX = col * this.grid.cellSize + this.grid.cellSize / 2;
        const cellCenterY = row * this.grid.cellSize + this.grid.cellSize / 2;

        // Vector apuntando desde el centro
        const dx = cellCenterX - centerX;
        const dy = cellCenterY - centerY;

        // Normalizar el vector
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const normalizedX = dx / dist;
          const normalizedY = dy / dist;

          // Hacer que la fuerza del vector sea inversamente proporcional a la distancia
          const strength = Math.min(1.0, 100 / dist);

          this.grid.setVector(col, row, {
            x: 0, // -Math.sin(normalizedX * 10) * strength,
            y: 0, // -normalizedY * strength,
          });
        }
      }
    }
  }

  /**
   * Bucle principal del juego
   */
  gameLoop() {
    this.contadorDeFrame++;

    this.graficoDebug.clear();

    // Renderizar la cuadrícula para depuración (llamar solo una vez)
    if (this.grid) {
      this.grid.render(this.graficoDebug);
    }

    for (let entidad of this.entidades) {
      // Almacenar posición antigua para la actualización de hashing espacial
      const oldX = entidad.x;
      const oldY = entidad.y;

      entidad.update();

      // Actualizar entidad en la cuadrícula
      if (this.grid) {
        this.grid.updateEntity(entidad, oldX, oldY);
      }
    }

    for (let entidad of this.entidades) {
      // Cambiar color a amarillo si la entidad está seleccionada
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
        // Restablecer al color original si no está seleccionada
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

  /**
   * Agrega un animal al juego en la posición especificada
   * @param {number} x - Coordenada X del animal
   * @param {number} y - Coordenada Y del animal
   */
  agregarAnimal(x, y) {
    let animal = new Animal(x, y, this);
    this.entidades.push(animal);

    // Añadir a la cuadrícula espacial
    if (this.grid) {
      this.grid.addEntity(animal);
    }
  }
}
