// Clase Juego
class Juego {
  constructor() {
    this.pausa = false;
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundColor: 0x1099bb,
    });
    document.body.appendChild(this.app.view);

    this.grid = new Grid(50, this.app); // Tamaño de celda 50
    this.zombies = [];
    this.balas = [];

    this.keyboard = {};

    this.ponerProtagonista();

    this.ponerZombies(500);

    this.ponerListeners();

    this.gridActualizacionIntervalo = 10; // Cada 10 frames
    this.contadorDeFrames = 0;
    setTimeout(() => {
      this.app.ticker.add(this.actualizar.bind(this));

      window.__PIXI_APP__ = this.app;
    }, 100);
  }

  ponerProtagonista() {
    this.player = new Player(
      window.innerWidth / 2,
      window.innerHeight *0.9,
      this
    );
  }

  ponerZombies(cant) {
    // Crear algunos zombies
    for (let i = 0; i < cant; i++) {
      const zombie = new Zombie(Math.random() * 800, Math.random() * 600, this); // Pasar la grid a los zombies
      this.zombies.push(zombie);
      this.grid.add(zombie);
    }
  }
  mouseDownEvent() {
    this.player.disparar();
  }

  ponerListeners() {
    // Manejar eventos del mouse
    this.app.view.addEventListener("mousedown", () => {
      (this.mouse || {}).click = true;
      this.mouseDownEvent();
    });
    this.app.view.addEventListener("mouseup", () => {
      (this.mouse || {}).click = false;
    });

    this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.app.view.addEventListener("mouseleave", () => {
      this.mouse = null;
    });
    window.addEventListener("resize", () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("keydown", (e) => {
      this.keyboard[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      delete this.keyboard[e.key];
    });
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

  actualizar() {
    if (this.pausa) return;
    this.contadorDeFrames++;

    this.player.update();
    this.zombies.forEach((zombie) => {
      zombie.update();
    });
    this.balas.forEach((bala) => {
      bala.update();
    });
  }
}

// Inicializar el juego
let juego = new Juego();
