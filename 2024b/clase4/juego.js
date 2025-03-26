class Juego {
  constructor() {
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth;
    this.alto = window.innerHeight;

    this.entidades = [];
    this.presas = [];
    this.depredadores = [];

    this.contadorDeFrame = 0;

    let promesa = this.app.init({ width: this.ancho, height: this.alto });

    this.ponerListeners();

    promesa.then((e) => {
      document.body.appendChild(this.app.canvas);
      window.__PIXI_APP__ = this.app;
      this.app.ticker.add(() => {
        this.gameLoop();
      });
    });
  }

  ponerListeners() {
    window.onmousemove = (e) => {
      this.mouse = { x: e.x, y: e.y };
    };
  }
  gameLoop() {
    this.contadorDeFrame++;

    for (let entidad of this.entidades) {
      entidad.update();
      entidad.render();
    }
  }

  agregarPresa(x, y) {
    let presa = new Presa(x, y, this);
    this.entidades.push(presa);
    this.presas.push(presa);
  }
  agregarDepredador(x, y) {
    let depre = new Depredador(x, y, this);
    this.entidades.push(depre);
    this.depredadores.push(depre);
  }
}
