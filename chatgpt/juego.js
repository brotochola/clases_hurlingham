// Clase Juego
class Juego {
  constructor() {
    this.pausa = false;
    this.app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
    });
    document.body.appendChild(this.app.view);

    this.grid = new Grid(50, this.app); // Tamaño de celda 50
    this.zombies = [];

    // Guardar la posición del mouse
    this.mouse = new PIXI.Point(
      this.app.view.width / 2,
      this.app.view.height / 2
    );

    // Crear algunos zombies
    for (let i = 0; i < 500; i++) {
      const zombie = new Zombie(
        Math.random() * 800,
        Math.random() * 600,
        this.grid,
        this.app,this
      ); // Pasar la grid a los zombies
      this.zombies.push(zombie);
      this.grid.add(zombie);
      this.app.stage.addChild(zombie.sprite);
    }

    // Manejar eventos del mouse
    this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.app.view.addEventListener("mouseleave", () => {
      this.mouse = null;
    });

    this.gridActualizacionIntervalo = 10; // Cada 10 frames
    this.contadorDeFrames = 0;
    setTimeout(() => {
      this.app.ticker.add(this.actualizar.bind(this));
    }, 100);
  }

  // Actualizar la posición del mouse
  onMouseMove(event) {
    this.mouse = { x: 0, y: 0 };
    const rect = this.app.view.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
  pausar() {
    this.pausa = !this.pausa;
  }

  actualizar(delta) {
    if (this.pausa) return;
    this.contadorDeFrames++;

    // if (this.contadorDeFrames >= this.gridActualizacionIntervalo) {
    //   this.zombies.forEach((zombie) => {
    //     this.grid.update(zombie); // Actualizar la posición del zombie en la grid
    //   });
    //   this.contadorDeFrames = 0;
    // }

    this.zombies.forEach((zombie) => {
      zombie.comportamiento(this.zombies, this.mouse); // Pasar la posición del mouse
      zombie.actualizar();
    });
  }
}

// Inicializar el juego
let juego = new Juego();
