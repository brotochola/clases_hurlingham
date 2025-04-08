class Juego {
  constructor() {
    this.chaboncitos = [];
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = 800;
    this.alto = 600;

    let promesa = this.app.init({ width: this.ancho, height: this.alto });

    promesa.then((e) => {
      document.body.appendChild(this.app.canvas);
      window.__PIXI_APP__ = this.app;
      this.app.ticker.add(() => {
        this.gameLoop();
      });

      this.ponerChaboncitos(10);
    });
  }

  gameLoop(time) {
    this.time = time;

    this.contadorDeFrame++;

    for (let i = 0; i < this.chaboncitos.length; i++) {
      this.chaboncitos[i].update(time);
    }
  }

  ponerChaboncitos(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      this.chaboncitos.push(
        new Chaboncito(
          Math.random() * 500,
          Math.random() * 500,
          this.app,
          i,
          this
        )
      );
    }
  }
}
