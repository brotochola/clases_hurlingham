class Juego {
  constructor() {
    console.log("constructor de juego");

    this.width = 1024;
    this.height = 768;
    // Creamos la app de pixi como propiedad de la clase juego
    this.app = new PIXI.Application({ width: this.width, height: this.height });

    globalThis.__PIXI_APP__ = this.app;
    this.arrayDeAutitos = [];
    this.contadorDeFrames = 0;
    this.ultimoFrame = 0;
    this.delta;
    this.fps;
    // Habilitamos el ordenamiento por profundidad (z-index)
    this.app.stage.sortableChildren = true;

    document.body.appendChild(this.app.view);

    this.preload();
  }

  graficosListos(loader, resources) {
    // Creamos el sprite sheet con la textura y los datos del atlas
    const spriteSheet = new PIXI.Spritesheet(
      resources.textureImage.texture,
      resources.texture.data
    );

    // Parseamos el sprite sheet y creamos los chaboncitos
    spriteSheet.parse(() => {
      for (let i = 0; i < 10; i++) {
        this.arrayDeAutitos.push(new ChaboncitoAnimado(this, spriteSheet, i));
      }
      this.empezarElGameloop();
    });
  }

  empezarElGameloop() {
    this.update();
  }

  preload() {
    // Cargamos el atlas de texturas y la imagen
    this.app.loader
      .add("texture", "sprite/texture.json")
      .add("textureImage", "sprite/texture.png")
      .load((loader, resources) => {
        this.graficosListos(loader, resources);
      });
  }

  update() {
    // Gameloop principal
    this.contadorDeFrames++;
    this.delta = performance.now() - this.ultimoFrame;
    this.fps = 1000 / this.delta;
    this.ultimoFrame = performance.now();

    // Actualizamos cada chaboncito
    for (let i = 0; i < this.arrayDeAutitos.length; i++) {
      const unAuto = this.arrayDeAutitos[i];
      unAuto.update();
    }

    requestAnimationFrame(() => this.update());
  }
}
