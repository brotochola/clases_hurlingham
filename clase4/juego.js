class Juego {
  constructor() {
    this.entidades = [];
    this.pixiApp = new PIXI.Application();
    this.pixiApp
      .init({ background: "#000000", resizeTo: window })
      .then(() => this.init());
  }

  gameLoop(time) {
    // console.log(time);
    for (let entidad of this.entidades) {
      entidad.update(time);
    }
  }
  init() {
    document.body.appendChild(this.pixiApp.canvas);
    this.pixiApp.ticker.add((time) => {
      this.gameLoop(time);
    });

    window.globalThis.__PIXI_APP__ = this.pixiApp;
  }

  agregarEntidad(x,y) {
    this.entidades.push(new Entidad(x, y, this));
  }
}
