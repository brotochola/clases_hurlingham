class Juego {
  constructor() {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth;
    this.alto = window.innerHeight;
    this.anchoCelda = 50;
    this.entidades = [];
    // this.presas = [];
    // this.depredadores = [];

    this.mouse = { x: 0, y: 0 };

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
      this.grilla = new Grilla(this, this.anchoCelda);

      this.graficoDebug = new PIXI.Graphics();
      this.graficoDebug.name = "grafico debug";

      this.app.stage.addChild(this.graficoDebug);

      for (let i = 0; i < 1000; i++) {
        this.agregarAnimal(500, 500, this);
      }
    });
  }

  ponerListeners() {
    window.onmousemove = (e) => {
      this.mouse = { x: e.x, y: e.y };
    };
  }
  gameLoop() {
    this.contadorDeFrame++;

    this.graficoDebug.clear();

    for (let entidad of this.entidades) {
      entidad.update();
      // entidad.render();
    }

    for (let entidad of this.entidades) {
      // entidad.update();
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
  }
}
