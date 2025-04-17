class Juego {
  constructor() {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth;
    this.alto = window.innerHeight;

    this.mouse = { x: 0, y: 0 };

    this.gravedad = { x: 0, y: 3 };

    this.personas = [];
    this.arboles = [];
    this.presas = [];
    this.depredadores = [];

    this.app.init({ width: this.ancho, height: this.alto }).then(() => {
      this.pixiListo();
    });
  }

  pixiListo() {
    console.log("pixi listo");

    document.body.appendChild(this.app.canvas);

    this.ponerEventListeners();

    window.__PIXI_APP__ = this.app;

    this.ponerPresas(100);
    this.ponerDepredadores(1);

    this.ponerArboles(120);

    this.app.stage.sortableChildren = true;

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
    for (let i = 0; i < this.arboles.length; i++) {
      this.arboles[i].update();
    }

    for (let i = 0; i < this.personas.length; i++) {
      this.personas[i].update();
    }

    for (let i = 0; i < this.personas.length; i++) {
      this.personas[i].render();
    }
    for (let i = 0; i < this.arboles.length; i++) {
      this.arboles[i].render();
    }
  }

  ponerArboles(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const arbol = new Arbol(
        Math.random() * this.ancho,
        Math.random() * this.alto,
        this
      );

      this.arboles.push(arbol);
    }
  }

  ponerPresas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const chabon = new Presa(
        Math.random() * this.ancho,
        Math.random() * this.alto,
        this
      );
      chabon.asignarAceleracion(Math.random() * 20, Math.random() * 2);
      this.personas.push(chabon);
      this.presas.push(chabon);
    }
  }

  ponerDepredadores(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const chabon = new Depredador(
        Math.random() * this.ancho,
        Math.random() * this.alto,
        this
      );
      chabon.asignarAceleracion(Math.random() * 20, Math.random() * 2);
      this.personas.push(chabon);
      this.depredadores.push(chabon);
    }
  }
}
