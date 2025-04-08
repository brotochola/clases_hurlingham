class Juego {
  constructor() {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = 800;
    this.alto = 600;

    this.mouse = { x: 0, y: 0 };

    this.gravedad = { x: 0, y: 3 };

    this.personas = [];

    this.app.init({ width: this.ancho, height: this.alto }).then(() => {
      this.pixiListo();
    });
  }

  pixiListo() {
    console.log("pixi listo");

    document.body.appendChild(this.app.canvas);

    this.ponerEventListeners();

    window.__PIXI_APP__ = this.app;

    this.ponerChaboncitos(1);

    this.app.ticker.add(() => this.gameLoop());
  }

  ponerEventListeners() {
    window.onmousemove = (evento) => {
      this.cuandoSeMueveElMouse(evento);
    };
  }

  cuandoSeMueveElMouse(evento) {
    this.mouse.x = evento.x;
    this.mouse.y = evento.y;
  }
  gameLoop() {
    for (let i = 0; i < this.personas.length; i++) {
      this.personas[i].update();
    }

    for (let i = 0; i < this.personas.length; i++) {
      this.personas[i].render();
    }
  }

  ponerChaboncitos(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const chabon = new Persona(i * 50, i * 30, this);
      chabon.asignarAceleracion(Math.random() * 20, Math.random() * 2);
      this.personas.push(chabon);
    }
  }
}
