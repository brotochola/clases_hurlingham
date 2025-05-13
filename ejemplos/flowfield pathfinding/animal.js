class Animal extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.lado = 10;

    this.velMax = 3;
    this.accMax = 0.6;

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

    // Reference to the current cell containing this animal
    this.cell = null;

    // How strongly this entity is influenced by the vector field
    this.vectorFieldInfluence = window.vectorFieldInfluence ?? 1.66;
    this.numeroDeCeldasPAraMirarAlrededor =
      window.numeroDeCeldasPAraMirarAlrededor ?? 0.5;
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xffffff);
    this.container.addChild(this.grafico);
  }

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

    // Use spatial grid if available
    if (this.juego.grid && this.cell) {
      // Get entities from neighboring cells
      const nearbyEntities = this.cell.getEntitiesInNeighborhood();

      for (const otroAnimal of nearbyEntities) {
        if (this == otroAnimal) continue;

        let dist = distancia(this, otroAnimal);

        if (dist < this.vision) {
          this.animalesCerca.push(otroAnimal);
        }
      }
    } else {
      // Fallback to checking all entities if grid isn't available
      for (let i = 0; i < this.juego.entidades.length; i++) {
        const otroAnimal = this.juego.entidades[i];

        if (this == otroAnimal) continue;

        let dist = distancia(this, this.juego.entidades[i]);

        if (dist < this.vision) {
          this.animalesCerca.push(this.juego.entidades[i]);
        }
      }
    }

    //estan mas cerca:
    this.animalesMuyCerca = [];

    // Use entities we already found to check for very close ones
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

  separarmeDeLosQueEstanBastanteCerca() {
    const dx = this.promedioPosAnimalesMuyCerca.x - this.x;
    const dy = this.promedioPosAnimalesMuyCerca.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)
    // const factor = 0.1;

    if (distancia > 0) {
      this.aplicarFuerza(
        -(dx / distancia) * window.factorSeparacion,
        -(dy / distancia) * window.factorSeparacion
      );
    }
  }
  repelerDeCeldasBloqueadas() {
    if (!this.juego.grid || !this.cell) return;

    // Get the current cell's column and row
    const currentCol = Math.floor(this.x / this.juego.grid.cellSize);
    const currentRow = Math.floor(this.y / this.juego.grid.cellSize);

    // Check cells in a 3-cell radius around the current position
    const cellRadius = this.numeroDeCeldasPAraMirarAlrededor;

    for (let rowOffset = -cellRadius; rowOffset <= cellRadius; rowOffset++) {
      for (let colOffset = -cellRadius; colOffset <= cellRadius; colOffset++) {
        const checkCol = currentCol + colOffset;
        const checkRow = currentRow + rowOffset;

        // Skip if outside grid bounds
        if (
          checkCol < 0 ||
          checkCol >= this.juego.grid.cols ||
          checkRow < 0 ||
          checkRow >= this.juego.grid.rows
        ) {
          continue;
        }

        // Get the cell at this position
        const cellIndex = this.juego.grid.getCellIndex(checkCol, checkRow);
        if (cellIndex === -1) continue;

        const cell = this.juego.grid.cells[cellIndex];

        // If the cell is blocked, apply repulsion force immediately
        if (cell && cell.blocked) {
          // Vector pointing from blocked cell to animal
          const dx = this.x - cell.centerX;
          const dy = this.y - cell.centerY;

          // Calculate distance
          const distance = Math.hypot(dx, dy);

          // Skip if we're too far away or at distance zero
          if (
            distance === 0 ||
            distance >
              this.juego.grid.cellSize * this.numeroDeCeldasPAraMirarAlrededor
          )
            continue;

          // Calculate repulsion force (stronger when closer)
          const repulsionStrength =
            (window.factorRepulsionDeCeldasBloqueadas ?? 1.5) *
            (1 -
              distance /
                (this.juego.grid.cellSize *
                  this.numeroDeCeldasPAraMirarAlrededor));

          // Apply normalized force
          this.aplicarFuerza(
            (dx / distance) * repulsionStrength,
            (dy / distance) * repulsionStrength
          );
        }
      }
    }
  }

  update() {
    super.update();

    this.mirarAlrededor();
    // this.irHaciaMisAmigos();
    // this.alinearmeConMisAmigos();

    if (this.juego.selectedEntities.includes(this)) {
      this.aplicarFuerzaVectorField();
    } else {
      this.perseguirMouse();
    }

    this.separarmeDeLosQueEstanBastanteCerca();
    this.repelerDeCeldasBloqueadas();

    this.velocidad.x *= 0.9;
    this.velocidad.y *= 0.9;
  }
  perseguirMouse() {
    const dx = this.juego.mouse.x - this.x;
    const dy = this.juego.mouse.y - this.y;
    const distancia = Math.hypot(dx, dy); // o Math.sqrt(dx*dx + dy*dy)
    const factor = window.factorPerseguirMouse ?? 1.1;

    if (distancia > 0) {
      this.aplicarFuerza((dx / distancia) * factor, (dy / distancia) * factor);
    }
  }

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
